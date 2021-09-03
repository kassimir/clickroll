// MY USEFUL FUNCTIONS

// query selector: returns Nodelist if multiple elements or single Node if single element
const q = ele => document.querySelectorAll(ele).length > 1 ? document.querySelectorAll(ele) : document.querySelector(ele)
// query selector for multiple elements from one parent: returns array
const qs = (ele, ...args) => {
  if (!ele || !args.length) return

  const ret = []
  args.forEach( child => {
    if (ele.querySelector(child)) ret.push(ele.querySelector(child))
  })

  if (ret.length !== args.length) return []
  else return ret
}

// creates elements
const create = (ele, attrs, listeners) => {
  // create element
  const e = document.createElement(ele)
  // add any attributes
  if (attrs) {
    Object.keys(attrs).forEach( attr => {
      if (typeof attrs[attr] === 'object' && !Array.isArray(attrs[attr])) {
        Object.keys(attrs[attr]).forEach( a => e[attr][a] = attrs[attr][a])
      } else {
        if (attr === 'class') {
          if (Array.isArray(attrs[attr])) attrs[attr].forEach( c => e.classList.add(c))
          else e.classList.add(attrs[attr])
        }
        else if (attr.includes('data')) e.setAttribute(attr, attrs[attr])
        else e.style[attr] = attrs[attr]
      }
    })
  }
  // add any event listeners
  if (listeners) {
    for (let l in listeners) {
      if (listeners.hasOwnProperty(l)) e.addEventListener(l, listeners[l])
    }
  }
  return e
}

// appends multiple elements to a single node
const appendChildren = (parent, ...children) => {
  if (!children.length) return

  let ret = false
  if (children[children.length - 1] === 'return') {
    children.pop()
    ret = true
  }
  children.forEach( child => parent.appendChild(child))
  if (ret) return parent
}

// Fancy shit to add a function to a div
HTMLDivElement.prototype.addIcon = function(icon, size = 1) {
  const cls = size === 1 ? ['fas', `fa-${icon}`] : ['fas', `fa-${icon}`, `fa-${size}x`]
  this.appendChild(create('i', {class: cls}))
}

// ELEMENT CONSTANTS
const ROLL_SET_CONTAINER = q('#roll-set-container')
const ROLL_CONTAINER = q('#roll-container')
const HISTORY = q('#history')
const BODY = q('body')

// ROLL SET CONSTANT
const ROLLSETS = {}

// Add roll set div
const addRollSet = () => {
  if (q('#new-roll-set')) return

  // Container for new roll set
  const newRollSet = create('div')
  newRollSet.id = 'new-roll-set'
  // Name the roll set
  const rollSetName = create('input', {width: '375px', height: '35px', paddingLeft: '20px'})
  rollSetName.id = 'roll-set-name'
  rollSetName.type = 'text'
  rollSetName.placeholder = 'Name of Roll Set'
  // Container for buttons
  const buttonDiv = create('div', {width: '100%', height: '35px', display: 'flex'})
  const addDamageSourceButton = create('div', {width: '40%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'darksalmon'})
  addDamageSourceButton.onclick = () => addDamageSource(newRollSet)
  addDamageSourceButton.addIcon('plus')
  const saveRollSetButton = create('div', {width: '40%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'darkseagreen'})
  saveRollSetButton.onclick = () => saveRollSet()
  saveRollSetButton.addIcon('save')
  const cancelRollSetButton = create('div', {width: '20%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'tomato'})
  cancelRollSetButton.onclick = () => cancelRollSet()
  cancelRollSetButton.addIcon('times')
  const infoDiv = create('div', {width: '100%', height: '22px', textAlign: 'center'})
  infoDiv.id = 'infodiv'
  const infoSpan = create('span')
  infoSpan.id = 'infospan'
  infoDiv.appendChild(infoSpan)
  addDamageSourceButton.onmouseenter = () => infoSpan.textContent = 'Add Damage Source'
  saveRollSetButton.onmouseenter = () => infoSpan.textContent = 'Save Roll Set'
  cancelRollSetButton.onmouseenter = () => infoSpan.textContent = 'Cancel'
  buttonDiv.onmouseleave = () => infoSpan.textContent = ''
  newRollSet.appendChild(rollSetName)
  appendChildren(buttonDiv, addDamageSourceButton, saveRollSetButton, cancelRollSetButton)
  appendChildren(newRollSet, buttonDiv, infoDiv)
  BODY.appendChild(newRollSet)
}

// Add damage source div
const addDamageSource = (rollSetContainer) => {
  // Container for entire thing
  const dmgContainer = create('div', {class: 'damage-source', width: '100%', height: '55px', display: 'flex', flexDirection: 'column', alignItems: 'center'})
  // Title of damage
  const dmgTitle = create('input', {class: 'damage-input', type: 'text', display: 'block', width: '95%', height: '22px'})
  dmgTitle.placeholder = 'Damage Source'
  // Number of die div
  const dieNumDiv = create('div')
  // Number of die text
  const dieNumTxt = create('span')
  dieNumTxt.textContent = 'Number of die'
  // Number of die input
  const dieNumInput = create('input', {class: ['tiny-input', 'num-input']})
  appendChildren(dieNumDiv, dieNumTxt, dieNumInput)
  // Number of sides div
  const dieSidesDiv = create('div')
  // Number of sides text
  const dieSidesTxt = create('span')
  dieSidesTxt.textContent = 'Number of sides'
  // Number of sides input
  const dieSidesInput = create('input', {class: ['tiny-input', 'sides-input']})
  appendChildren(dieSidesDiv, dieSidesTxt, dieSidesInput)
  appendChildren(dmgContainer, dmgTitle, dieNumDiv, dieSidesDiv)

  rollSetContainer.appendChild(dmgContainer)
}

// Save roll set
const saveRollSet = () => {
  const nrs = q('#new-roll-set')
  if (!nrs) return

  const infospan = q('#infospan')

  const name = q('#roll-set-name').value

  if (!name) {
    infospan.textContent = 'Please name your roll set. It\'s at the top'
    return
  }
  const rollSetData = nrs.querySelectorAll('.damage-source')
  if (!rollSetData.length) {
    infospan.textContent = 'Please add a damage source or click "Cancel"'
    return
  }
  const rollSet = create('div', {width: '90%', padding: '10px', margin: '10px', border: '1px solid tomato'})
  const rollSetName = create('span', {display: 'block', fontSize: '150%', fontWeight: 'bold'})
  rollSetName.textContent = name
  rollSet.appendChild(rollSetName)

  Array.from(rollSetData).forEach( source => {
    const [
        title,
        die,
        sides
    ] = qs(source, '.damage-input', '.num-input', '.sides-input')
    if (!title || !die || !sides) {
      infospan.textContent = 'You did something wrong.'
      return
    }
    const rollSetDmgSrc = create('span', {display: 'block', fontSize: '120%'})
    rollSetDmgSrc.textContent = title.value || 'Blank'
    const rollSetDieNum = create('span')
    rollSetDieNum.textContent = `${die.value || 'Blank'}d`
    const rollSetDieSides = create('span', {marginBottom: '8px'})
    rollSetDieSides.textContent = sides.value || 'Blank'
    appendChildren(rollSet, rollSetDmgSrc, rollSetDieNum, rollSetDieSides)
  })
  ROLL_SET_CONTAINER.appendChild(rollSet)
  cancelRollSet()
}

// Cancel roll set
const cancelRollSet = () => {
  const n = q('#new-roll-set')
  if (n) n.parentElement.removeChild(n)
}
