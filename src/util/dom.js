function $$swap(ele1, ele2) {
    var p1 = ele1.parentNode, left, s_ele;
    if(p1 !== ele2.parentNode) {
        return;
    }
    s_ele = ele2.previousElementSibling;
    if(!s_ele) {
        s_ele = ele2.nextElementSibling;
        left = false;
    } else {
        left = true;
    }
    p1.insertBefore(ele2, ele1);
    if(s_ele === ele1) {
        return;
    }
    if(left) {
        p1.insertBefore(ele1, s_ele);
    } else {
        p1.appendChild(ele1);
    }

}

function $on(ele, event_name, event_handler) {
    ele.addEventListener(event_name, event_handler);
}

function $$before(new_ele, ele) {
    ele.parentNode.insertBefore(new_ele, ele);
}
function $$remove(ele) {
    ele.parentNode.removeChild(ele);
}
function $$all(query) {
    return document.querySelectorAll(query);
}

function $$append(parent, ele) {
    parent.appendChild(ele);
}


function $$id(id) {
    return document.getElementById(id);
}

function $css(ele, name, value) {
    //todo name如果是'background-color'这样的带短横线的，要转成'backgroundColor'
    if(typeof name === 'object') {
        for(var kn in name) {
            ele.style[kn] = name[kn];
        }
    } else {
        ele.style[name] = value;
    }
}
function $attr(ele, attr_name, attr_value) {
    if(typeof attr_value !== 'undefined') {
        ele.setAttribute(attr_name, attr_value);
    } else {
        return ele.getAttribute(attr_name);
    }
}
function $hasAttr(ele, attr_name) {
    if(attr_name instanceof Array) {
        for(var i=0;i<attr_name.length;i++) {
            if(!ele.hasAttribute(attr_name[i])) {
                return false;
            }
        }
    } else {
        return ele.hasAttribute(attr_name);
    }
}

function $removeAttr(ele, attr_name) {
    ele.removeAttribute(attr_name);
}