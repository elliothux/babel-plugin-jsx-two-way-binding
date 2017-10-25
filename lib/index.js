
function objValueStr2AST(objValueStr, t) {
    const values = objValueStr.split('.');
    if (values.length === 1)
        return t.identifier(values[0]);
    return t.memberExpression(
        objValueStr2AST(values.slice(0, values.length - 1).join('.'), t),
        objValueStr2AST(values[values.length - 1], t)
    )
}

function objPropStr2AST(key, value, t) {
    key = key.split('.');
    return t.objectProperty(
        t.identifier(key[0]),
        key2ObjCall(key, t)
    );

    function key2ObjCall(key, t, index) {
        !index && (index = 0);
        if (key.length - 1 === index) return objValueStr2AST(value, t);
        return t.callExpression(
            t.memberExpression(
                t.identifier('Object'),
                t.identifier('assign')
            ),
            [
                objValueStr2AST(indexKey2Str(index + 1, key), t),
                t.objectExpression([
                    t.objectProperty(
                        t.identifier(key[index + 1]),
                        key2ObjCall(key, t, index + 1)
                    )
                ])
            ]
        );

        function indexKey2Str(index, key) {
            const str = ['_state'];
            for (let i = 0; i < index; i++) str.push(key[i]);
            return str.join('.')
        }
    }
}

function objExpression2Str(expression) {
    let objStr;
    switch (expression.object.type) {
        case 'MemberExpression':
            objStr = objExpression2Str(expression.object);
            break;
        case 'Identifier':
            objStr = expression.object.name;
            break;
        case 'ThisExpression':
            objStr = 'this';
            break;
    }
    return objStr + '.' + expression.property.name;
}


module.exports = {
    objValueStr2AST,
    objPropStr2AST,
    objExpression2Str
};