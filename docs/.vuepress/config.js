module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around',
  themeConfig: {
    nav: [
      // { text: 'Home', link: '/guide/' },
      { text: 'Typescript', link: '/guide/a/' },
      { text: 'Node', link: '/guide/a/' },
      { text: '配置', link: 'https://www.vuepress.cn/config/' },
    ],
    sidebar: {
      '/guide/': [
        {
          title: '基础',  //组名
          collapsable: false,
          children: [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
          ],   //该分组下要显示的文件的目录
        },
        {
          title: '进阶',  //组名
          collapsable: false,
          children: [
            
          ],
        },
        {
          title: '工程',  //组名
          collapsable: false,
          children: [
          ],
        }
      ]
    },
  }
}