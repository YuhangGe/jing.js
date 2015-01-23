var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;
var __env_counter = 0;
var __root_env_table = {};

function Environment(name, parent) {

    $defineProperty(this, '$name', name);
    $defineProperty(this, '$children', {});
    $defineProperty(this, '$parent', parent ? parent : null);

}

var __env_prototype = Environment.prototype;

$defineGetterSetter(__env_prototype, '$root', function() {
    return this.$parent ? this.$parent.$root : this;
});

$defineProperty(__env_prototype, '$child', function(name) {
    if(!name) {
        name = this.$parent ? this.$parent.name + '.' + __scope_counter++ : 'jing.scope.' + __scope_counter++;
    }
    var cd = this.$children;
    if($hasProperty(cd, name)) {
        return cd[name];
    } else {
        var cs = new Scope(name, this);
        $defineProperty(cd, name, cs, false, true);
        return cs;
    }
});

/*
 * 取得变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$val', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.$parent) {
        return this.$parent.$val(var_name);
    } else {
        return null;
    }
});
/*
 * 检测是否存在变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$has', function(var_name) {
    if($hasProperty(this, var_name)) {
        return true;
    } else if(this.$parent) {
        return this.$parent.$has(var_name);
    } else {
        return false;
    }
});

/*
 * 取得变量名所在的env，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$get', function(var_name) {
   if($hasProperty(this, var_name)) {
       return this;
   } else if(this.$parent) {
       return this.$parent.$var(var_name);
   } else {
       return null;
   }
});
/*
 * 设置变量名对应的值，会循环检索父亲env。
 */
$defineProperty(__env_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.$parent) {
        this.$parent.set(var_name, value);
    }
});

/**
 * 添加成员的辅助方法。在env中可以使用:
 *
 *   this.$prop({
 *      name : 'xiaoge',
 *      age : 10,
 *      say : function() {
 *          alert('hello, ' + this.name);
 *      }
 *   });
 *   this.$prop('name', 'xiaoge');
 *
 * 也可以直接在this上赋值，如：
 *   this.name = 'xiaoge';
 *   this.age = 10;
 *   this.say = function() {
 *      alert('hello, '+this.name);
 *   }
 */
$defineProperty(__env_prototype, '$prop', function(name, value) {
   if($isObject(name)) {
       for(var kn in name) {
           this[kn] = name[kn];
       }
   } else {
       this[name] = value;
   }
});


function environment_create(parent) {
    var name = this.$parent ? this.$parent.name + '.' + __env_counter++ : 'jing.scope.' + __env_counter++;
    var cs = new Environment(name, parent);
    if(parent) {
        $defineProperty(parent.$children, name, cs, false, true);
    }
    return cs;
}