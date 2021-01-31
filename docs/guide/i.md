# 类型检查机制

类型检查机制:

Typescript 编译器在做类型检查时,所秉承的一些原则,以及边现出的一些行为.
作用:辅助开发提高开发效率

- 类型推断
- 类型兼容性
- 类型保护

## 类型推断

不需要指定变量的类型(函数的返回值类型),Typescript 可以根据某些规则自动的为其推断出一个类型

- 基础类型推断
- 最佳通用类型推断
- 上下文类型推断

## 基础类型推断

```ts
let a = 1; //let a: number

let c = { x: 1, y: "a" };

let d = (x = 1) => x + 1; //类型推断 let d: (x?: number) => number
```

## 最佳通用类型推断:

当需要从多个类型推断出一个类型的时候,ts 就尽可能的推断出兼容当前类型的通用类型

```ts
let b = [1, null];
window.onkeydown = (event) => {
  // console.log(event.button)
};
```

联合类型 let b: (number | null)[],关闭 "strictNullChecks": false 后,推断通用类型 let b: number[]

### 从右到左类型推断(上下文类型推断)

通常发生在时间处理中

```ts
window.onkeydown = (event) => {
  //(parameter) event : KeyboardEvent
  console.log(event.button);
};
```

# 类型断言

有些时候,ts 的类型推断不符合预期,ts 提供提供一种方法,允许覆盖 ts 的推论

```ts
interface Foo {
  bar: number;
}

let foo = {} as Foo;
let foo = <Foo>{}; //类型断言另一种,在react容易引起歧义
let foo: Foo = {
  //类型断言容易遗漏属性,建议定义类型
  bar: 1,
};
foo.bar = 1; //类型“{}”上不存在属性“bar”
```

> 类型断言可以增加代码的灵活性,在改造旧代码非常有效,但是使用类型断言,禁止滥用,要对上下文内容有着充足的预判,没有任何根据的类型断言,会给你的代码带来安全的隐患

## 类型的兼容性

当一个类型 y 可以被赋值给另一个类型 x 时,我们就可以说类型 x 兼容类型 y
x 兼容 y: x(目标类型) = Y(源类型)

```ts
// 接口兼容性
interface X {
  a: any;
  b: any;
}
interface Y {
  a: any;
  b: any;
  c: any;
}
let x: X = { a: 1, b: 2 };
let y: Y = { a: 1, b: 2, c: 3 };
x = y;
y = x; //类型 "X" 中缺少属性 "c"，但类型 "Y" 中需要该属性
```

> 接口兼容性:成员少的兼容成员多的(鸭式辩型法)

### 函数兼容性

- 参数个数

```ts
type Handler = (a: number, b: number) => void;
function hof(handler: Handler) {
  return handler;
}

// 1)参数个数
let handler1 = (a: number) => {};
hof(handler1);
let handler2 = (a: number, b: number, c: number) => {};
hof(handler2); //类型“(a: number, b: number, c: number) => void”的参数不能赋给类型“Handler”的参数。ts(2345)
```

- 可选参数和剩余参数

```ts
let a = (p1: number, p2: number) => {};
let b = (p1?: number, p2?: number) => {};
let c = (...args: number[]) => {};
a = b;
a = c;
b = a;
b = c;
c = a;
c = b;
```

> 可选参数、剩余参数和固定参数函数互相兼容

- 参数类型

```ts
interface Point3D {
  x: number;
  y: number;
  z: number;
}
interface Point2D {
  x: number;
  y: number;
}
let p3d = (point: Point3D) => {};
let p2d = (point: Point2D) => {};
p3d = p2d;
p2d = p3d; //error
/*不能将类型“(point: Point3D) => void”分配给类型“(point: Point2D) => void”。
  参数“point”和“point” 的类型不兼容。
  类型 "Point2D" 中缺少属性 "z"，但类型 "Point3D" 中需要该属性。*/
```

> ,函数参数双向协变: 打开"strictFunctionTypes": false,可以解决函数兼容问题

- 返回值类型

```ts
let f = () => ({ name: "Alice" });
let g = () => ({ name: "Alice", location: "Beijing" });
f = g;
g = f; //error
```

和接口兼容性一样

- 函数重载

```ts
function overload(a: number, b: number, c: number): number;
function overload(a: any, b: any): any {}
function overload(a: string, b: string): string; //函数实现缺失或未立即出现在声明之后
```

```ts
function overload(a: number, b: number, c: number): number;
function overload(a: string, b: string): string; //此重载签名与其实现签名不兼容。
function overload(a: any, b: any, c: any): any {}
```

> 函数重载,any 类型和函数参数个数最多必须在放在函数重载列表最后

- 枚举兼容性

```ts
enum Fruit {
  Apple,
  Banana,
}
enum Color {
  Red,
  Yellow,
}
let fruit: Fruit.Apple = 1;
let no: number = Fruit.Apple;
let color: Color.Red = Fruit.Apple; //error
```

> 枚举和 number 互相兼容,枚举本身不兼容

- 类兼容性

```ts
class A {
  constructor(p: number, q: number) {}
  id: number = 1;
  private name: string = "";
}
class B {
  static s = 1;
  constructor(p: number) {}
  id: number = 2;
  private name: string = "";
}
class C extends A {}
let aa = new A(1, 2);
let bb = new B(1);
aa = bb;
bb = aa;
let cc = new C(1, 2);
aa = cc;
cc = aa;
```

> 在比较两个类实例是否兼容时,静态属性和构造方法不参加比较,除父子类,包含私有属性的类互不兼容,

- 泛型兼容性

```ts
// 泛型兼容性
interface Empty<T> {
  value: T;
}
let obj1: Empty<number> = {}; //类型 "{}" 中缺少属性 "value"，但类型 "Empty<number>" 中需要该属性。
let obj2: Empty<string> = {}; //
obj1 = obj2; //不能将类型“Empty<string>”分配给类型“Empty<number>”。不能将类型“string”分配给类型“number”。ts(2322)
```

```ts
let log1 = <T>(x: T): T => {
  console.log("x");
  return x;
};
let log2 = <U>(y: U): U => {
  console.log("y");
  return y;
};
log1 = log2;
```

> 没有成员的接口可以互相兼容,没有指定类型参数的泛型函数可以互相兼容

**口诀:**

**结构之间兼容:成员少的兼容成员多的**

**函数之间兼容:参数多的兼容参数少的**

# 类型保护

## 一、联合类型

> A type guard is some expression that performs a runtime check that guarantees the type in some scope. —— TypeScript 官方文档

在 TypeScript 中，一个变量不会被限制为单一的类型。如果你希望一个变量的值，可以有多种类型，那么就可以使用 TypeScript 提供的联合类型。下面我们来举一个联合类型的例子

```ts
let stringOrBoolean: string | boolean = "Semlinker";

interface Cat {
  numberOfLives: number;
}

interface Dog {
  isAGoodBoy: boolean;
}

let animal: Cat | Dog;
```

## 二、类型保护

TypeScript 能够在特定的区块中保证变量属于某种确定的类型。
可以在此区块中放心地引用此类型的属性，或者调用此类型的方法

```ts
enum Type {
  Strong,
  Week,
}

class Java {
  helloJava() {
    console.log("Hello Java");
  }
  java: any;
}

class JavaScript {
  helloJavaScript() {
    console.log("Hello JavaScript");
  }
  js: any;
}
```

```ts
enum Type {
  Strong,
  Week,
}

class Java {
  helloJava() {
    console.log("Hello Java");
  }
  java: any;
}

class JavaScript {
  helloJavaScript() {
    console.log("Hello JavaScript");
  }
  js: any;
}
//4.自定义类型保护的类型谓词（type predicate）
function isJava(lang: Java | JavaScript): lang is Java {
  //is 类型谓词
  return (lang as Java).helloJava !== undefined;
}

function getLanguage(type: Type, x: string | number) {
  let lang = type === Type.Strong ? new Java() : new JavaScript();

  if ((lang as Java).helloJava) {
    (lang as Java).helloJava();
  } else {
    (lang as JavaScript).helloJavaScript();
  }

  // 1.instanceof 判断一个实例是不是属于某个类
  if (lang instanceof Java) {
    lang.helloJava();
    // lang.helloJavaScript()
  } else {
    lang.helloJavaScript();
  }

  // 2.in 判断某个属性是不是属于某个对象
  if ("java" in lang) {
    lang.helloJava();
  } else {
    lang.helloJavaScript();
  }

  //3. typeof 判断属性类型
  if (typeof x === "string") {
    console.log(x.length);
  } else {
    console.log(x.toFixed(2));
  }

  //4.自定义类型保护的类型谓词（type predicate）
  if (isJava(lang)) {
    lang.helloJava();
  } else {
    lang.helloJavaScript();
  }

  return lang;
}

getLanguage(Type.Week, 1);
```

`typeof`类型保护只支持两种形式：`typeof v === "typename"` 和 `typeof v !== typename`，`"typename"` 必须是 `"number"`， `"string"`， `"boolean"` 或 `"symbol"`。 但是 TypeScript 并不会阻止你与其它字符串比较，语言不会把那些表达式识别为类型保护。

## 三、类型谓词

当您可能熟悉“ in”，“ typeof”和“ instanceof”时，您可能想知道什么是“类型谓词”。类型谓词是一种特殊的返回类型，它向 Typescript 编译器发出信号，告知特定值是什么类型。类型谓词始终附加到带有单个参数并返回布尔值的函数。类型谓词表示为 argumentName is Type。

```ts
interface Cat {
  numberOfLives: number;
}
interface Dog {
  isAGoodBoy: boolean;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return typeof animal.numberOfLives === "number";
}
```

对于示例函数，`isCat`就像所有其他类型的防护一样在运行时执行。由于此函数返回一个布尔值，而且包括类型谓词`animal is Cat`.如果`isCat`评估为真,打字稿编译器将正确施放`animal`的`Cat`，如果 `isCat`计算结果为假,它会也投`animal`的`Dog`.

```ts
let animal: Cat | Dog = {
  numberOfLives: 2,
};

if (isCat(animal)) {
  // animal successfully cast as a Cat
  console.log("this is cat");
} else {
  // animal successfully cast as a Dog
  console.log("this is dog");
}
```

> 自定义类型警卫和类型谓词的最好的事情是我们不仅可以使用`in`，`instanceof`以及`typeof`在我们的类型后卫，但我们也可以自定义类型检查。只要我们的函数返回一个布尔值，Typescript 就会做正确的事

## 四、参考资源

- [aha-understanding-typescript-s-type-predicates](https://dev.to/daveturissini/aha-understanding-typescript-s-type-predicates-40ha)
- [https://rangle.io/blog/how-to-use-typescript-type-guards](https://rangle.io/blog/how-to-use-typescript-type-guards/)
