jing.js
=======

Flexible javascript MVW framework

当前项目还处于探索学习阶段！
------

当前代码处理实验阶段，项目文件结构还略显混乱。在demo/simple文件夹下面可以看到示例及代码注释文档。

Todos
------

* $watch机制的销毁策略。（Important\!）
* j-repeat还有许多工作需要完善和改进。包括使用diff思想，复用组件，以及销毁不再使用的组件的$watch
* $watch和j-repeat可能存在潜在的内存泄露。

关于$watch机制
------
$watch机制目前使用的是基于$defineProperty($defineGetterSetter)来做的。
目前的策略是，会向下传递变更；但只有被$watch过的节点，才会向上传递。具体来说，
比如现在有:
````
env.A = {
    B : {
        C : 'c',
        D : 'd'
    },
    E : 'e'
}
````
对`A`进行$watch, `env.$watch('A', fn_a)`，然后执行`env.A.B.C='c2'`，
这种情况下对`A`的$watch的回调`fn_a`不会被调用。接下来，对`A.B.C`进行$watch：`env.$watch('A.B.C', fn_c)`，
然后再执行`env.A.B.C='c3'`，则`fn_c`和`fn_a`都会被调用。执行`env.A = '...'`，`fn_a`和`fn_c`也
都会被调用。

目前的策略的问题是，在不少的情况下，即使`A.B.C`没有被$watch过，当其值发生变化时，也应该向上传递变更，
使得`fn_a`被调用。AngularJS采用的是贪婪对比检测，能够支持向上传递。jing.js要支持向上传递，可以在`A`被$watch时，
递归地同时$watch其所有子节点(deep watch)。

deep watch的潜在问题是，如果被$watch的节点的子节点层次和数量都非常大，
那是否有可能带来性能上的影响？比如夸张点的例子是，`A`这个Object有10层，每层有10个元素，
整颗树也有10的10次方个节点了，而可能UI界面真正用到的，只是其中的某个节点，采用deep watch策略并不恰当。

todo. 接下来jing.js也会提供可选的deep watch方式，$watch函数可传入指定为deep watch的参数。

模块化和命名约定
------
由于jing.js是纯浏览器端库，不会被使用在nodejs平台上，
因此本项目没有采取开发时使用nodejs的模块加载方式，然后使用
Browserify合并给浏览器使用。原因是感觉这样做会带来额外的代码，
不够纯粹，而且开发时调试也不是很方便。

为了尽可能地达到信息隐藏和代码压缩后最小化的原则，
jing.js采取了一种比较原始的类似于c语言的模块化开发方式。

* 每个模块/子模块都是一个文件夹，该文件夹下面和文件夹同名的.js文件，
  是该模块首先依赖的文件。

* 项目在Build的时候，需要在Gruntfile里面手动指定模块
  的加载顺序，比如['util', 'scope', ... , 'jing']。
  这样Grunt就知道按这个顺序去访问文件夹，把所有的代码拼接起来，
  然后包裹到`(function(){})()`这样一个函数中。

  * 'util'模块应该是全局的Utility模块，需要首先依赖。
  * 'jing'模块是jing.js对外提供接口的模块。

* 单个模块采取的命名规则为：

  * 所有函数使用`{{模块名}}_{{功能}}`的命名方式，
    全部采用小写，英文单词之间用`_`隔开。如`scope_create`， `parse_expression`。
  * 所有模块内的全局变量，采用`__{{模块名}}_{{功能}}`的命名方式，
    全部采用小写，英文单词之间用`_`隔开。如`__scope_table`，`__parse_op_stack`。
  * 所有类定义，类名采用和其它语言一样采用驼峰命名，类成员属性和变量都采用`_`分隔的小写英文单词。

jing.js的目标是一个**小而美**的[MVW(Model View Whatever)](http://stackoverflow.com/questions/13329485/mvw-what-does-it-stand-for)框架，
它本身并不是一个架构复杂的需要低耦合的多模块系统，
反而是模块之间需要比较高度内聚可以高效配合的精良库。
比如在`scope`模块中，如果有需要，可以直接访问`parse`模块的`__parse_op_stack`变量。
而且在Build时，通过将代码组合然后用`(function(){})()`包裹的方式，
可以让几乎所有变量和函数名都可以被重命名压缩。


开发和测试
----
jing.js并不会按照严格地测试驱动方式开发，但会尽量拥抱测试。
目前采用的测试方案是：karma + mocha + chai，`test/cases`文件夹下面是所有
的测试用例。开发和测试的具体步骤如下：

1. 安装nodejs和npm和bower）
2. 安装grunt：`npm install -g grunt-cli`。
3. 安装项目依赖包，切换到`项目根目录`下，执行：`npm install`（这个步骤可能会花一些时间）。
4. 安装bower依赖，其实就是jQuery，用来测试：`bower install`。
5. 在`项目根目录`下执行grunt命令：
   * `grunt test`：运行测试
   * `grunt build`：生成发布版本

由于使用karma.js测试会一次性测试全部用例，比较耗时，遇到问题也不好调试。会同时在浏览器端使用mocha测试，这样方便只测试某个文件，同时调试。

测试与DOM元素相关的用例时，采用的方法是在测试用例里把html注入到页面中。使用
[https://github.com/karma-runner/karma-html2js-preprocessor](https://github.com/karma-runner/karma-html2js-preprocessor)
来实现这个机制。

