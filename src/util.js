import store from './store'


export function formatDate(jsonString) {
    return jsonString ? new Date(jsonString).toLocaleString() : ""
}

export const re = new RegExp("^(-?)([0-9]{1,6})(?:/([0-9]{1,2})(?:/([0-9]{1,2}))?)?$")

export function solarText(value) {
    if (!value) return ""
    let arr = re.exec(value)
    if (arr === null) return ""
    let txt = '', bc = '', y = Number.parseInt(arr[2])
    if (arr[1] === '-' || y === 0) {
        bc = " BC"
        y = y + 1
    }
    txt += y
    if (arr[3] !== undefined)
        txt += '/' + Number.parseInt(arr[3])
    if (arr[4] !== undefined)
        txt += '/' + Number.parseInt(arr[4])
    return txt + bc
}

export function solarDate(value) {
    if (!value) return new Date()
    let arr = re.exec(value)
    if (arr === null) return new Date()
    let bc = arr[1]
    let y1 = Number.parseInt(arr[2])
    if (y1 >= 10000) bc = '+'
    let y = '0'.repeat((bc === '-' || bc === '+' ? 6 : 4) - ('' + y1).length) + y1
    let m = arr[3] === undefined ? "01" : '0'.repeat(2 - arr[3].length) + arr[3]
    let d = arr[4] === undefined ? "01" : '0'.repeat(2 - arr[4].length) + arr[4]
    return new Date(`${bc}${y}-${m}-${d}T00:00:00.000`)
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

export function viewUrl(id, table, field, width) {
    let url = `${window.location.protocol}//${window.location.host}/api/files/view/${id}`
    let arr = []
    if (table) arr.push(`table=${table}`)
    if (field) arr.push(`field=${field}`)
    if (width) arr.push(`width=${width}`)
    if (arr.length > 0)
        url += '?' + arr.join("&")
    return url
}
