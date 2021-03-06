/**
 * Advanced OpenWorkflow, Automating SugarCRM.
 * @package Advanced OpenWorkflow for SugarCRM
 * @copyright SalesAgility Ltd http://www.salesagility.com
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 * along with this program; if not, see http://www.gnu.org/licenses
 * or write to the Free Software Foundation,Inc., 51 Franklin Street,
 * Fifth Floor, Boston, MA 02110-1301  USA
 *
 * @author SalesAgility <info@salesagility.com>
 */


var condln = 0;
var condln_count = 0;
var flow_fields =  new Array();
var flow_module = '';

document.getElementById('flow_module').addEventListener("change", showModuleFields, false);

function loadConditionLine(condition){

    var prefix = 'aow_conditions_';
    var ln = 0;

    ln = insertConditionLine();

    for(var a in condition){
        if(document.getElementById(prefix + a + ln) != null){
            document.getElementById(prefix + a + ln).value = condition[a];
        }
    }

    var select_field = document.getElementById('aow_conditions_field'+ln);
    document.getElementById('aow_conditions_field_label'+ln).innerHTML = select_field.options[select_field.selectedIndex].text;

    if (condition['value'] instanceof Array) {
        condition['value'] = JSON.stringify(condition['value'])
    }

    showModuleField(ln, condition['operator'], condition['value_type'], condition['value'])

    //getView(ln,action['id']);

}

function showModuleFields(){

    clearConditionLines();

    flow_module = document.getElementById('flow_module').value;

    if(flow_module != ''){

        var callback = {
            success: function(result) {
                flow_fields = result.responseText;
                document.getElementById('btn_ConditionLine').disabled = '';
            }
        }

        var connectionObject = YAHOO.util.Connect.asyncRequest ("GET", "index.php?module=AOW_WorkFlow&action=getModuleFields&aow_module="+flow_module,callback);

    } else {
        document.getElementById('btn_ConditionLine').disabled = 'disabled';
    }

}

function showModuleField(ln, operator_value, type_value, field_value){
    if (typeof operator_value === 'undefined') { operator_value = ''; }
    if (typeof type_value === 'undefined') { type_value = ''; }
    if (typeof field_value === 'undefined') { field_value = ''; }

    var aow_field = document.getElementById('aow_conditions_field'+ln).value;
    if(aow_field != ''){

        var callback = {
            success: function(result) {
                document.getElementById('aow_conditions_operatorInput'+ln).innerHTML = result.responseText;
                SUGAR.util.evalScript(result.responseText);
            },
            failure: function(result) {
                document.getElementById('aow_conditions_operatorInput'+ln).innerHTML = '';
            }
        }
        var callback2 = {
            success: function(result) {
                document.getElementById('aow_conditions_fieldTypeInput'+ln).innerHTML = result.responseText;
                SUGAR.util.evalScript(result.responseText);
                document.getElementById('aow_conditions_fieldTypeInput'+ln).onchange = function(){showModuleFieldType(ln);};
            },
            failure: function(result) {
                document.getElementById('aow_conditions_fieldTypeInput'+ln).innerHTML = '';
            }
        }
        var callback3 = {
            success: function(result) {
                document.getElementById('aow_conditions_fieldInput'+ln).innerHTML = result.responseText;
                SUGAR.util.evalScript(result.responseText);
                enableQS(false);
            },
            failure: function(result) {
                document.getElementById('aow_conditions_fieldInput'+ln).innerHTML = '';
            }
        }

        var aow_operator_name = "aow_conditions_operator["+ln+"]";
        var aow_field_type_name = "aow_conditions_value_type["+ln+"]";
        var aow_field_name = "aow_conditions_value["+ln+"]";

        YAHOO.util.Connect.asyncRequest ("GET", "index.php?module=AOW_WorkFlow&action=getModuleOperatorField&view="+action_sugar_grp1+"&aow_module="+flow_module+"&aow_fieldname="+aow_field+"&aow_newfieldname="+aow_operator_name+"&aow_value="+operator_value,callback);
        YAHOO.util.Connect.asyncRequest ("GET", "index.php?module=AOW_WorkFlow&action=getFieldTypeOptions&view="+action_sugar_grp1+"&aow_module="+flow_module+"&aow_fieldname="+aow_field+"&aow_newfieldname="+aow_field_type_name+"&aow_value="+type_value,callback2);
        YAHOO.util.Connect.asyncRequest ("GET", "index.php?module=AOW_WorkFlow&action=getModuleFieldType&view="+action_sugar_grp1+"&aow_module="+flow_module+"&aow_fieldname="+aow_field+"&aow_newfieldname="+aow_field_name+"&aow_value="+field_value+"&aow_type="+type_value,callback3);

    } else {
        document.getElementById('aow_conditions_operatorInput'+ln).innerHTML = ''
        document.getElementById('aow_conditions_fieldTypeInput'+ln).innerHTML = '';
        document.getElementById('aow_conditions_fieldInput'+ln).innerHTML = '';
    }
}

function showModuleFieldType(ln, value){
    if (typeof value === 'undefined') { value = ''; }

    var callback = {
        success: function(result) {
            document.getElementById('aow_conditions_fieldInput'+ln).innerHTML = result.responseText;
            SUGAR.util.evalScript(result.responseText);
            enableQS(false);
        },
        failure: function(result) {
            document.getElementById('aow_conditions_fieldInput'+ln).innerHTML = '';
        }
    }

    var aow_field = document.getElementById('aow_conditions_field'+ln).value;
    var type_value = document.getElementById("aow_conditions_value_type["+ln+"]").value;
    var aow_field_name = "aow_conditions_value["+ln+"]";

    YAHOO.util.Connect.asyncRequest ("GET", "index.php?module=AOW_WorkFlow&action=getModuleFieldType&view="+action_sugar_grp1+"&aow_module="+flow_module+"&aow_fieldname="+aow_field+"&aow_newfieldname="+aow_field_name+"&aow_value="+value+"&aow_type="+type_value,callback);

}


/**
 * Insert Header
 */

function insertConditionHeader(){
    tablehead = document.createElement("thead");
    tablehead.id = "conditionLines_head";
    document.getElementById('conditionLines').appendChild(tablehead);

    var x=tablehead.insertRow(-1);
    x.id='conditionLines_head';

    var a=x.insertCell(0);
    //a.style.color="rgb(68,68,68)";

    var b=x.insertCell(1);
    b.style.color="rgb(0,0,0)";
    b.innerHTML=SUGAR.language.get('AOW_Conditions', 'LBL_FIELD');

    var c=x.insertCell(2);
    c.style.color="rgb(0,0,0)";
    c.innerHTML=SUGAR.language.get('AOW_Conditions', 'LBL_OPERATOR');

    var d=x.insertCell(3);
    d.style.color="rgb(0,0,0)";
    d.innerHTML=SUGAR.language.get('AOW_Conditions', 'LBL_VALUE_TYPE');

    var e=x.insertCell(4);
    e.style.color="rgb(0,0,0)";
    e.innerHTML=SUGAR.language.get('AOW_Conditions', 'LBL_VALUE');
}

function insertConditionLine(){

    if (document.getElementById('conditionLines_head') == null) {
        insertConditionHeader();
    } else {
        document.getElementById('conditionLines_head').style.display = '';
    }


    tablebody = document.createElement("tbody");
    tablebody.id = "aow_conditions_body" + condln;
    document.getElementById('conditionLines').appendChild(tablebody);


    var x = tablebody.insertRow(-1);
    x.id = 'product_line' + condln;

    var a = x.insertCell(0);
    if(action_sugar_grp1 == 'EditView'){
        a.innerHTML = "<button type='button' id='aow_conditions_delete_line" + condln + "' class='button' value='" + SUGAR.language.get(module_sugar_grp1, 'LBL_REMOVE_PRODUCT_LINE') + "' tabindex='116' onclick='markConditionLineDeleted(" + condln + ")'><img src='themes/default/images/id-ff-remove-nobg.png' alt='" + SUGAR.language.get(module_sugar_grp1, 'LBL_REMOVE_CONDITION_LINE') + "'></button><br>";
        a.innerHTML += "<input type='hidden' name='aow_conditions_deleted[" + condln + "]' id='aow_conditions_deleted" + condln + "' value='0'><input type='hidden' name='aow_conditions_id[" + condln + "]' id='aow_conditions_id" + condln + "' value=''>";
    } else{
        a.innerHTML = condln +1;
    }
    a.style.width = '5%';


    var b = x.insertCell(1);
    b.style.width = '20%';
    var viewStyle = 'display:none';
    if(action_sugar_grp1 == 'EditView'){viewStyle = '';}
    b.innerHTML = "<select style='width:178px;"+viewStyle+"' name='aow_conditions_field["+ condln +"]' id='aow_conditions_field" + condln + "' value='' title='' tabindex='116' onchange='showModuleField(" + condln + ");'>" + flow_fields + "</select>";
    if(action_sugar_grp1 == 'EditView'){viewStyle = 'display:none';}else{viewStyle = '';}
    b.innerHTML += "<span style='width:178px;"+viewStyle+"' id='aow_conditions_field_label" + condln + "' ></span>";


    var c = x.insertCell(2);
    c.id='aow_conditions_operatorInput'+condln;
    c.style.width = '20%';

    var d = x.insertCell(3);
    d.id='aow_conditions_fieldTypeInput'+condln;
    d.style.width = '20%';

    var e = x.insertCell(4);
    e.id='aow_conditions_fieldInput'+condln;
    e.style.width = '35%';

    condln++;
    condln_count++;

    return condln -1;
}

function markConditionLineDeleted(ln)
{
    // collapse line; update deleted value
    document.getElementById('aow_conditions_body' + ln).style.display = 'none';
    document.getElementById('aow_conditions_deleted' + ln).value = '1';
    document.getElementById('aow_conditions_delete_line' + ln).onclick = '';

    condln_count--;
    if(condln_count == 0){
        document.getElementById('conditionLines_head').style.display = "none";
    }
}

function clearConditionLines(){

    if(document.getElementById('conditionLines') != null){
        var cond_rows = document.getElementById('conditionLines').getElementsByTagName('tr');
        var cond_row_length = cond_rows.length;
        var i;
        for (i=0; i < cond_row_length; i++) {
            if(document.getElementById('aow_conditions_delete_line'+i) != null){
                document.getElementById('aow_conditions_delete_line'+i).click();
            }
        }
    }
}


function hideElem(id){
    if(document.getElementById(id)){
        document.getElementById(id).style.display = "none";
        document.getElementById(id).value = "";
    }
}

function showElem(id){
    if(document.getElementById(id)){
        document.getElementById(id).style.display = "";
    }
}

function date_field_change(field){
    if(document.getElementById(field + '[1]').value == 'now'){
        hideElem(field + '[2]');
        hideElem(field + '[3]');
    } else {
        showElem(field + '[2]');
        showElem(field + '[3]');
    }
}

