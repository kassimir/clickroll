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
// Builds an array dice rolls
const roll = (max, times = 1) => new Array(times).fill(0).map( _ => Math.floor(Math.random() * max) + 1 )

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
// ROLL SET HISTORY
const ROLLHISTORY = []

// Add roll set div
const addRollSet = () => {
  if (q('#new-roll-set')) return

  // Container for new roll set
  const newRollSet = create('div', {transform: 'translateX(-700px)'})
  newRollSet.id = 'new-roll-set'
  // Name the roll set
  const rollSetName = create('input', {width: '675px', height: '35px', paddingLeft: '20px'})
  rollSetName.id = 'roll-set-name'
  rollSetName.type = 'text'
  rollSetName.placeholder = 'Name of Roll Set'
  // Container for buttons
  const buttonDiv = create('div', {width: '100%', height: '35px', display: 'flex'})
  const saveRollSetButton = create('div', {width: '80%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'darkseagreen'})
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
  const damageSourceDiv = create('div', {width: '100%', display: 'flex', flexDirection: 'row'})
  const addDamageSourceButton = create('div', {width: '100%', height: '35px', textAlign: 'center', class: ['roll-buttons', 'add-buttons'], backgroundColor: 'darksalmon', borderRight: '1px solid black'})
  addDamageSourceButton.onclick = () => addDamageSource(newRollSet)
  addDamageSourceButton.innerHTML = `<span>Damage</span>`
  const addModifierButton = create('div', {width: '100%', height: '35px', textAlign: 'center', class: ['roll-buttons', 'add-buttons'], backgroundColor: 'darksalmon'})
  addModifierButton.innerHTML = `<span>Modifier</span>`
  appendChildren(damageSourceDiv, addDamageSourceButton, addModifierButton)
  appendChildren(buttonDiv, saveRollSetButton, cancelRollSetButton)
  appendChildren(newRollSet, buttonDiv, rollSetName, damageSourceDiv)
  BODY.appendChild(newRollSet)
  // Custom animation
  const animate = setInterval(() => {
    let t = parseInt(newRollSet.style.transform.slice(11), 10) + 10
    if (t >= 0) {
      clearInterval(animate)
      t = 0
    }
    newRollSet.style.transform = `translateX(${t}px)`
  }, 7)
}

// Add damage source div
const addDamageSource = (rollSetContainer) => {
  // Container for entire thing
  const dmgContainer = create('div', {class: 'damage-source', width: '100%', height: '55px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'})
  // Title of damage
  const dmgTitle = create('input', {class: 'damage-input', type: 'text', width: '45%', height: '22px'})
  dmgTitle.placeholder = 'Damage Source'
  // Number of die text
  const dieNumTxt = create('span')
  dieNumTxt.textContent = 'Die'
  // Number of die input
  const dieNumInput = create('input', {class: ['tiny-input', 'num-input']})
  dieNumInput.placeholder = '#'
  // Number of sides text
  const dieSidesTxt = create('span')
  dieSidesTxt.textContent = 'Sides'
  // Number of sides input
  const dieSidesInput = create('input', {class: ['tiny-input', 'sides-input']})
  dieSidesInput.placeholder = '#'
  const cancelElement = create('div')
  cancelElement.addIcon('times')
  appendChildren(dmgContainer, dmgTitle, dieNumTxt, dieNumInput, dieSidesTxt, dieSidesInput, cancelElement)

  rollSetContainer.appendChild(dmgContainer)
}

// Save roll set
const saveRollSet = () => {
  const nrs = q('#new-roll-set')
  if (!nrs) return

  const infospan = q('#infospan')

  const name = q('#roll-set-name').value

  if (!name) {
    infospan.textContent = 'Please name your roll set.'
    return
  }
  const rollSetData = nrs.querySelectorAll('.damage-source')
  if (!rollSetData.length) {
    infospan.textContent = 'Please add a damage source or click "Cancel"'
    return
  }
  const rollSet = create('div', {width: '90%', padding: '10px', margin: '10px', border: '1px solid black'})
  const titleDiv = create('div', {display: 'flex', justifyContent: 'space-between'})
  const rollSetName = create('span', {fontSize: '150%', fontWeight: 'bold'})
  rollSetName.textContent = name
  rollSet.appendChild(rollSetName)
  const rollButton = create('div', {class: 'roll-that-shit'})
  rollButton.textContent = 'ROLL'
  rollButton.onclick = () => rollTheDice(name)
  appendChildren(titleDiv, rollSetName, rollButton)
  rollSet.appendChild(titleDiv)
  ROLLSETS[name] = []
  Array.from(rollSetData).forEach( source => {
    const [
        title,
        die,
        sides,
        // modifiers
    ] = qs(source, '.damage-input', '.num-input', '.sides-input')
    const rollSetDmgSrc = create('span', {display: 'block', fontSize: '120%'})
    rollSetDmgSrc.textContent = title.value || 'Blank'
    const rollSetDieNum = create('span')
    rollSetDieNum.textContent = `${die.value || 'Blank'}d`
    const rollSetDieSides = create('span', {marginBottom: '8px'})
    rollSetDieSides.textContent = sides.value || 'Blank'
    ROLLSETS[name].push({title: title.value, die: die.value, sides: sides.value})
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

function rollTheDice(name) {
  // Clear previous roll (if there is one)
  if (ROLL_CONTAINER.children.length) Array.from(ROLL_CONTAINER.children).forEach(child => ROLL_CONTAINER.removeChild(child))
  // Total of all rolls and modifiers
  let total = 0
  // Start of the history input
  const history = {[name]: []}
  // Loop through roll set dice to roll them
  ROLLSETS[name].forEach( source => {
    const rollSection = create('div', {class: 'roll-section'})
    const src = create('div', {class: 'roll-section_title'})
    src.textContent = source.title
    const die = create('div')
    die.textContent = `${source.die}d${source.sides}`
    const amt = create('div')
    const rollArray = roll(+source.sides, +source.die)
    const rollReduced = rollArray.reduce( (p,c) => p + c)
    amt.textContent = `${rollArray.toString().split(',').join('+')} = ${rollReduced}`
    total += rollReduced
    history[name].push({[source.title]: {rolls: rollArray, total: rollReduced}})
    appendChildren(rollSection, src, die, amt)
    ROLL_CONTAINER.appendChild(rollSection)
  })
  ROLLHISTORY.push(history)
  const totalDisplay = create('div', {class: ['roll-section', 'roll-total']})
  totalDisplay.textContent = total
  ROLL_CONTAINER.appendChild(totalDisplay)
}
