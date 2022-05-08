import store from './store'


export function formatDate(jsonString) {
    return jsonString ? new Date(jsonString).toLocaleString() : ""
}

export function fieldToJson(isAll, metaFields) {
    let field = "*"
    if (!isAll) {
        field = {}
        metaFields.forEach(el => {
            let rw = (el.r ? 0b01 : 0b00) | (el.w ? 0b10 : 0b00)
            if (rw > 0b00) {
                field[el.name] = rw
            }
        })
    }
    return field
}

export function check(permStr) {
    let r = false
    const perms = store.getters.perms
    if (perms == null) return r
    const words = permStr.split(':')
    const rw = words[2] == 'r' ? 0b01 : (words[2] == 'w' ? 0b10 : 0b00)
    try {
        if (words[1] == '*') {
            const permsT = perms[words[0]]
            for (let p in permsT) {
                throw new Error("功能未实现");
            }
        } else if (words[1] == '?') {
            throw new Error("功能未实现");
        } else {
            r = ((perms[words[0]][words[1]]) & rw) == rw
        }
    } catch (error) {
        console.error(error)
    }
    return r
}

export function isDisabled(isEdit, checked, perm) {
    if (!isEdit && checked == undefined) checked = true
    return !(checked && check(perm))
}
