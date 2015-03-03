function Environment(name, parent) {
    $defineProperty(this, '__', {
        prop : $bind(this, environment_def_props),
        emit_tree : new RootEmitNode(this),
        name : name,
        children : {},
        parent : parent ? parent : null
    });
}

var __env_prototype = Environment.prototype;
$defineGetterSetter(__env_prototype, '$name', function() {
    return this.__.name;
});
$defineGetterSetter(__env_prototype, '$children', function() {
    return this.__.children;
});
$defineGetterSetter(__env_prototype, '$parent', function() {
    return this.__.parent;
});

$defineGetterSetter(__env_prototype, '$root', function() {
    return this.__.parent ? this.__.parent.$root : this;
});

$defineProperty(__env_prototype, '$child', function(name) {
    var cd = this.__.children;
    if($hasProperty(cd, name)) {
        return cd[name];
    } else {
        var cs = new Environment(name, this);
        $defineProperty(cd, name, cs, false, true);
        return cs;
    }
});

/*
 * 取得变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$get', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.__.parent) {
        return this.__.parent.$get(var_name);
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
    } else if(this.__.parent) {
        return this.__.parent.$has(var_name);
    } else {
        return false;
    }
});

/*
 * 取得变量名所在的env，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$find', function(var_name) {
   if($hasProperty(this, var_name)) {
       return this;
   } else if(this.__.parent) {
       return this.__.parent.$find(var_name);
   }
});
/*
 * 设置变量名对应的值，会循环检索父亲env。
 */
$defineProperty(__env_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.__.parent) {
        this.__.parent.$set(var_name, value);
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
 *   this.$prop = {
 *      name : 'xiaoge'
 *   }
 *
 * 也可以直接在this上赋值，如：
 *   this.name = 'xiaoge';
 *   this.age = 10;
 *   this.say = function() {
 *      alert('hello, '+this.name);
 *   }
 */
$defineGetterSetter(__env_prototype, '$prop', function() {
    return this.__.prop;
}, function() {
    environment_def_props.apply(this, arguments);
});

function environment_def_props(name, value) {
    if($isObject(name)) {
        for(var kn in name) {
            this[kn] = name[kn];
        }
    } else {
        this[name] = value;
    }
}

function environment_create_child(env, c_name) {
    var cd = env.__.children;
    var cs = new Environment(c_name, env);
    /*
     * 这里的第4个参数一定要为true，才能覆盖。
     */
    $defineProperty(cd, c_name, cs, true, false);
    return cs;
}

//
//function environment_create(parent) {
//    var name = this.__.parent ? this.__.parent.name + '.' + __env_counter++ : 'jing.scope.' + __env_counter++;
//    var cs = new Environment(name, parent);
//    if(parent) {
//        $defineProperty(parent.$children, name, cs, false, true);
//    }
//    return cs;
//}