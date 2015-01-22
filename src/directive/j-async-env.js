/*
 *
 * <div j-async-env='AEnv'>
 *      <ul j-async-env-ready>
 *          <li j-repeat='item in data.list' j-on='click: test(item, @index)'>
 *              {{item.name}}, {{item.amount}}
 *          </li>
 *      </ul>
 *      <div j-async-env-loading>
 *          <p>Loading...</p>
 *      </div>
 * </div>
 */

var __directive_j_async_env_queue = [];

function JAsyncEnv(root_ele, ready_ele, load_ele, drive_module, env) {

}

function directive_deal_j_async_env(ele, drive_module, env) {

}