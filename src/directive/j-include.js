/*
 *
 * 使用方法如下，注意一定要用双引号把字符串包裹，因为j-include接受的也是表达式。
 * <div j-include='"home.html"'>
 *   <p>Loading...</p>
 * </div>
 * j-include是异步的过程，因此可以在其下显示加载完成前的提示，比如Loading...。
 * 加载成功后，该元素会被替换，并且解析里面的指令。
 *     如果加载失败，该元素会被替换为：<p class='j-include-error'>Error on j-include</p>
 *
 * j-include支持使用表达式，如下：
 *
 * jing('MyApp').factory('Template', {
 * });
 * jing('MyApp').init(function(module, $rootEnv) {
 *
 *      $rootEnv.include_urls = module.require('Template');
 *
 * })
 * .drive(document.body);
 *
 * <div j-include='include_urls.home'></div>
 *
 * 通过这种方式，可以将整个App的构建放在Template中，方便修改以及部署。
 *
 * 注意当前版本的设计，j-include和j-async-env不能同时存在。（似乎没有价值同时存在。）
 */
function JInclude(ele, drive_module, env) {
    this.ele = ele;
    this.module = drive_module;
    this.env = env;
}
var __jinclude_prototype = JInclude.prototype;
__jinclude_prototype.run = function(url) {
    $ajax({
        url : url,
        method : 'get',
        type : 'text',
        success : $bind(this, this.success),
        error : $bind(this, this.error)
    });
};
__jinclude_prototype.success = function(body) {
    var ele = this.ele,
        pn = ele.parentNode;
    var new_ele = document.createElement("div");
    var frag = document.createDocumentFragment();
    var chs = new_ele.childNodes,
        i,
        e = chs.length;
    new_ele.innerHTML = body;
    for(i=0;i<e;i++) {
        drive_parse_element(chs[i], this.module, this.env);
        frag.appendChild(chs[i]);
    }
    pn.insertBefore(frag, ele);
    pn.removeChild(ele);
};
__jinclude_prototype.error = function() {
    this.ele.innerHTML = '<p class="j-include-error">Error at j-include.</p>';
};

function directive_deal_j_include(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-include'),
        expr_str = item.value;

    var expr = parse_expression(expr_str);
    var url = expr.exec(env);

    if(!$isString(url)) {
        throw 'j-include need string.';
    }

    new JInclude(ele, drive_module, env).run(url);

}