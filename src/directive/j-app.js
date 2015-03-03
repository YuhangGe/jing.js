$ready(function() {
    var app_list = $$all('*[j-app]');
    if(app_list.length===0) {
        return;
    }

    $each(app_list, function(ele) {
        var m_name = $attr(ele, 'j-app'),
            module = module_create(m_name);
        module_drive_add(module, ele);
    });

    module_apply_drive();
});