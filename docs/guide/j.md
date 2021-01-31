# 高级类型

## 交叉类型

```ts
interface DogInterface {
  run(): void;
}
interface CatInterface {
  jump(): void;
}
let pet: DogInterface & CatInterface = {
  run() {},
  jump() {},
};
```

## 联合类型

```ts
let a: number | string = 1;
//自变量类型
let b: "a" | "b" | "c";
let c: 1 | 2 | 3;
```

```ts
class Dog implements DogInterface {
  run() {}
  eat() {}
}
class Cat implements CatInterface {
  jump() {}
  eat() {}
}
enum Master {
  Boy,
  Girl,
}
function getPet(master: Master) {
  let pet = master === Master.Boy ? new Dog() : new Cat();
  // pet.run()
  // pet.jump()
  pet.eat(); //可以访问交集方法
  return pet;
}
```

```ts
interface Square {
  kind: "square";
  size: number;
}
interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}
interface Circle {
  kind: "circle";
  radius: number;
}
type Shape = Square | Rectangle | Circle;
function area(s: Shape) /* :number */ {
  switch (s.kind) {
    case "square":
      return s.size * s.size;
    case "rectangle":
      return s.height * s.width;
    case "circle":
      return Math.PI * s.radius ** 2;
    default:
      return ((e: never) => {
        throw new Error(e);
      })(s);
  }
}
console.log(area({ kind: "circle", radius: 1 }));
```

> **交叉类型比较做对象混入,联合类型可以使代码具有不确定性,增强代码灵活性**

## 索引类型

下面是一个常见的 JavaScript 函数，实现从一个对象中选取指定属性，得到它们的属性值：

```ts
function pluck(o, names) {
  return names.map((n) => o[n]);
}
```

实现这样一个函数的类型定义要满足：

- 数组参数 names 中的元素，只能是对象 o 身上有的属性。
- 返回类型取决于参数 o 身上属性值的类型。

### 索引类型查询操作符 - keyof

`keyof` 可以获取对象的可访问索引字符串字面量类型。

```ts
interface Foo {
  id: number;
  readonly name: string;
  action: Function;
}
//// keyof T 该操作符可以用于获取某种类型的所有键,其返回类型是联合类型。
let a: keyof Foo; //let a: "id" | "name" | "action"
type b = keyof Foo; //type b = "id" | "name" | "action"
```

### 索引访问操作符 - T[K]

通过 `keyof` 拿到了属性名，接下来还要拿到属性名对应属性值的类型。

```ts
class Token {
  public secret: string = "ixeFoe3x.2doa";
  public accessExp: number = 60 * 60;
  public refreshExp: number = 60 * 60 * 24 * 30 * 3;
}

type token = keyof Token;
type valueType = Token[token]; // type valueType = string | number
type secret = Token["secret"]; // type secret = string
```

通过 Token['secret'] 拿到了属性 secret 的类型为 string。

那么这时，我们知道了一个对象的类型为泛型 T，这个对象的属性类型 K 只需要满足 K extends keyof T，即可得到这个属性值的类型为 T[K]。

理解了上面这段话，即可定义下面这个函数：

```ts
function getProperty<T, K extends keyof T>(o: T, name: K): T[K] {
  return o[name]; // o[name] is of type T[K]
}
interface User {
  id: number;
  name: string;
}
let u: User = {
  id: 5,
  name: "str",
};
getProperty(u, "name");
```

已知参数 o 的类型为 T，参数 name 的类型 K 满足 K extends keyof T，那么返回值的类型即为 T[K]。

## 映射类型

`ts`会将一些好用的工具类型纳入基准库中，方便开发者直接使用.例如可以将已知类型的每个属性都变为可选的或者只读的。

### Readonly 与 Partial 关键字

```ts
interface Person {
  name: string;
  age: number;
}

type PersonOptional = Partial<Person>; //type Partial<T> = { [P in keyof T]?: T[P]; }
type PersonReadonly = Readonly<Person>; //type Readonly<T> = { readonly [P in keyof T]: T[P]; }

type PersonOptional = {
  name?: string;
  age?: number;
};
type PersonReadonly = {
  readonly name: string;
  readonly age: number;
};
```

### 源码分析

来看它们的实现源码：

```
type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}
type Partial<T> = {
  [K in keyof T]?: T[K]
}
```

源码就使用了映射类型的语法 `[K in Keys]`，来看这个语法的两个部分：

1. 类型变量 `K`：它会依次绑定到每个属性，对应每个属性名的类型。
2. 字符串字面量构成的联合类型的 `Keys`：它包含了要迭代的属性名的集合。
   我们可以使用 `for...in` 来理解，它可以遍历目标对象的属性。

接下来继续分析：

- `Keys`，可以通过 `keyof` 关键字取得，假设传入的类型是泛型`T`，得到 `keyof T`，即为字符串字面量构成的联合类型`（"name" | "age"）`。
- [K in keyof T]`，将属性名一一映射出来。
- `T[K]`，得到属性值的类型。
  已知了这些信息，我们就得到了将一个对象所有属性变为可选属性的方法：

```ts
[K in keyof T]?: T[K]
```

进而可得：

```ts
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

`Readonly<T>` 和 `Partial<T>` 都有着广泛的用途，因此它们与 `Pick` 一同被包含进了 TypeScript 的标准库里：

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  id: number;
  age: number;
  name: string;
}

type PickUser = Pick<User, "id">;
```

代码解释：

最后一行，就相当于 `type PickUser = { id: number }`。

## 条件类型

条件类型（conditional type）就是在初始状态并不直接确定具体类型，而是通过一定的类型运算得到最终的变量类型

```ts
T extends U ? X : Y
```

语义类似三目运算符：若 `T` 是` U` 的子类型，则类型为 X``，否则类型为 `Y`。若无法确定 `T`是否为`U`的子类型，则类型为`X | Y`。

```ts
declare function f<T extends boolean>(x: T): T extends true ? string : number;

const x = f(Math.random() < 0.5); // const x: string | number

const y = f(true); // const y: string
const z = f(false); // const z: number
```

### 可分配条件类型

在条件类型 `T extends U ? X : Y` 中，当泛型参数 `T` 取值为 `A | B | C` 时，这个条件类型就等价于 `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`，这就是可分配条件类型。

可分配条件类型（distributive conditional type）中被检查的类型必须是裸类型参数（naked type parameter）。裸类型表示没有被包裹（Wrapped） 的类型，（如：`Array<T>`、`[T]`、Promise`<T>` 等都不是裸类型），简而言之裸类型就是未经过任何其他类型修饰或包装的类型

### 工具类型

- `Exclude<T, U>` – 从 `T` 中剔除可以赋值给 `U` 的类型。
- `E`xtract`<T, U>`– 提取`T`中可以赋值给`U` 的类型。
- `N`onNullable`<T>`– 从`T`中剔除`null`和`undefined`。
- `R`eturnType`<T>` – 获取函数返回值类型。
- `I`nstanceType`<T>`– 获取构造函数类型的实例类型。

再看一个进阶的例子，定义一种方法，可以取出接口类型中的函数类型：

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

interface Part {
  id: number;
  name: string;
  subparts: Part[];
  firstFn: (brand: string) => void;
  anotherFn: (channel: string) => string;
}

type FnNames = FunctionPropertyNames<Part>; ////type FnNames = "firstFn" | "anotherFn"
type FnProperties = FunctionProperties<Part>;
```

`{ [K in keyof T]: T[K] extends Function ? K : never }[keyof T]`其实就是遍历`Part`接口，然后通过条件类型判断接口的属性值的类型是否是函数类型，如果是函数类型，取其属性名.相当于

```ts
type FnNames = {
  id: never;
  name: never;
  subparts: never;
  firstFn: "firstFn";
  anotherFn: "anotherFn";
}["id" | "name" | "subparts" | "firstFn" | "anotherFn"];
```

这里通过属性名取出属性值,除去`never`属性值,所以 FnNames 的类型是`"firstFn" | "anotherFn"`
