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
// ele
//   element to be created
// atrs
//   this will typically be inline styles, but it can also be
//   class name(s) and even setting data-const
// listeners
//   adds event listeners or sets data-const
// dataConst
//   if attrs and listeners are present, then the last arg
//   is the data-const
const create = (ele, ...args) => {
  // create element
  const e = document.createElement(ele)
  // if no other arguments, return the element
  if (!args.length) return e
  // deconstruct array into constants
  const [
    attrs,
    listeners
  ] = args
  // In case I forget to add the data-const
  if (!args.length) args[0] = 'undefined'

  // set data-const based on number of arguments
  if (args.length === 1) {
    e.dataset.const = args[0]
    return e
  } else if (args.length === 2) {
    addAttrs()
    e.dataset.const = args[1]
    return e
  } else {
    addAttrs()
    addListeners()
    e.dataset.const = args[2]
    return e
  }

  function addAttrs() {
    // add any attributes
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

  function addListeners() {
  // add any event listeners
    for (let l in listeners) {
      if (listeners.hasOwnProperty(l)) e.addEventListener(l, listeners[l])
    }
  }
}
// Builds an array dice rolls
const roll = (max, times = 1) => new Array(times).fill(0).map( _ => Math.floor(Math.random() * max) + 1 )

// appends multiple elements to a single node
// const appendChildren = (parent, ...children) => {
//   if (!children.length) return
//
//   let ret = false
//   if (children[children.length - 1] === 'return') {
//     children.pop()
//     ret = true
//   }
//   children.forEach( child => parent.appendChild(child))
//   if (ret) return parent
// }

// Fancy shit to add a function to a div
HTMLDivElement.prototype.addIcon = function(icon, size = 1) {
  const cls = size === 1 ? ['fas', `fa-${icon}`] : ['fas', `fa-${icon}`, `fa-${size}x`]
  this.appendChild(create('i', {class: cls}, ''))
}

HTMLElement.prototype.appendChildren = function(...children) {
  if (!children.length) return

  let ret = false
  if (children[children.length - 1] === 'return') {
    children.pop()
    ret = true
  }
  children.forEach( child => this.appendChild(child))
  if (ret) return this
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
// FULL JSON
const COMPLETE_DATA = {
  ROLLSETS,
  ROLLHISTORY
}

// Add roll set div
const addRollSet = () => {
  if (q('#new-roll-set')) return

  // Container for new roll set
  const newRollSet = create('div', {transform: 'translateX(-700px)'}, 'newRollSet')
  newRollSet.id = 'new-roll-set'
  // Name the roll set
  const rollSetName = create('input', {width: '675px', height: '35px', paddingLeft: '20px'}, 'rollSetName')
  rollSetName.id = 'roll-set-name'
  rollSetName.type = 'text'
  rollSetName.placeholder = 'Name of Roll Set'
  // Container for buttons
  const buttonDiv = create('div', {width: '100%', height: '35px', display: 'flex'}, 'buttonDiv')
  const saveRollSetButton = create('div', {width: '80%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'darkseagreen'}, 'saveRollSetButton')
  saveRollSetButton.onclick = () => saveRollSet()
  saveRollSetButton.addIcon('save')
  const cancelRollSetButton = create('div', {width: '20%', height: '35px', textAlign: 'center', class: 'roll-buttons', backgroundColor: 'tomato'}, 'cancelRollSetButton')
  cancelRollSetButton.onclick = () => cancelRollSet()
  cancelRollSetButton.addIcon('times')
  const infoDiv = create('div', {width: '100%', height: '22px', textAlign: 'center'}, 'infoDiv')
  infoDiv.id = 'infodiv'
  const infoSpan = create('span', 'infoSpan')
  infoSpan.id = 'infospan'
  infoDiv.appendChild(infoSpan)
  const damageSourceDiv = create('div', {width: '100%', display: 'flex', flexDirection: 'row'}, 'damageSourceDiv')
  const addDamageSourceButton = create('div', {width: '100%', height: '35px', textAlign: 'center', class: ['roll-buttons', 'add-buttons'], backgroundColor: 'darksalmon', borderRight: '1px solid black'}, 'addDamageSourceButton')
  addDamageSourceButton.onclick = () => addDamageSource(newRollSet)
  addDamageSourceButton.innerHTML = `<span>Damage</span>`
  const addModifierButton = create('div', {width: '100%', height: '35px', textAlign: 'center', class: ['roll-buttons', 'add-buttons'], backgroundColor: 'darksalmon'}, 'addModifierButton')
  addModifierButton.innerHTML = `<span>Modifier</span>`
  // appendChildren(damageSourceDiv, addDamageSourceButton, addModifierButton)
  damageSourceDiv.appendChildren(addDamageSourceButton, addModifierButton)
  buttonDiv.appendChildren(saveRollSetButton, cancelRollSetButton)
  newRollSet.appendChildren(buttonDiv, rollSetName, damageSourceDiv)
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
  const dmgContainer = create('div', {class: 'damage-source', width: '100%', height: '55px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, 'dmgContainer')
  // Title of damage
  const dmgTitle = create('input', {class: 'damage-input', type: 'text', width: '45%', height: '22px'}, 'dmgTitle')
  dmgTitle.placeholder = 'Damage Source'
  // Number of die text
  const dieNumTxt = create('span', 'dieNumTxt')
  dieNumTxt.textContent = 'Die'
  // Number of die input
  const dieNumInput = create('input', {class: ['tiny-input', 'num-input']}, 'dieNumInput')
  dieNumInput.placeholder = '#'
  // Number of sides text
  const dieSidesTxt = create('span', 'dieSidesTxt')
  dieSidesTxt.textContent = 'Sides'
  // Number of sides input
  const dieSidesInput = create('input', {class: ['tiny-input', 'sides-input']}, 'dieSidesInput')
  dieSidesInput.placeholder = '#'
  const cancelElement = create('div', 'cancelElement')
  cancelElement.addIcon('times')
  dmgContainer.appendChildren(dmgTitle, dieNumTxt, dieNumInput, dieSidesTxt, dieSidesInput, cancelElement)

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
  const rollSet = create('div', {width: '90%', padding: '10px', margin: '10px', border: '1px solid black'}, 'rollSet')
  const titleDiv = create('div', {display: 'flex', justifyContent: 'space-between'}, 'titleDiv')
  const rollSetName = create('span', {fontSize: '150%', fontWeight: 'bold'}, 'rollSetName')
  rollSetName.textContent = name
  rollSet.appendChild(rollSetName)
  const rollButton = create('div', {class: 'roll-that-shit'}, 'rollButton')
  rollButton.textContent = 'ROLL'
  rollButton.onclick = () => rollTheDice(name)
  titleDiv.appendChildren(rollSetName, rollButton)
  rollSet.appendChild(titleDiv)
  ROLLSETS[name] = []
  Array.from(rollSetData).forEach( source => {
    const [
        title,
        die,
        sides,
        // modifiers
    ] = qs(source, '.damage-input', '.num-input', '.sides-input')
    const rollSetDmgSrc = create('span', {display: 'block', fontSize: '120%'}, 'rollSetDmgSrc')
    rollSetDmgSrc.textContent = title.value || 'Blank'
    const rollSetDieNum = create('span', 'rollSetDieNum')
    rollSetDieNum.textContent = `${die.value || 'Blank'}d`
    const rollSetDieSides = create('span', {marginBottom: '8px'}, 'rollSetDieSides')
    rollSetDieSides.textContent = sides.value || 'Blank'
    ROLLSETS[name].push({title: title.value, die: die.value, sides: sides.value})
    rollSet.appendChildren(rollSetDmgSrc, rollSetDieNum, rollSetDieSides)
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
  // Loop through roll set dice to roll them and build elements to display them.
  const rollSection = create('div', {width: '90%', display: 'flex', flexDirection: 'column', border: '1px solid black', marginBottom: '20px', zIndex: 1}, 'rollSection')
  const rollTitleDiv = create('div', {width: '98%', textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}, 'rollTitleDiv')
  const rollTitle = create('h2', {marginLeft: '25px'}, 'rollTitle')
  rollTitle.textContent = name
  const rollAmtDiv = create('div', {width: '2%'}, 'rollAmtDiv')
  const rollAmt = create('h2', 'rollAmt')
  rollAmtDiv.appendChild(rollAmt)
  rollTitleDiv.appendChildren(rollTitle, rollAmtDiv)
  rollSection.appendChild(rollTitleDiv)
  const diceDiv = create('div', {width: '100%', display: 'flex', flexDirection: 'row'}, 'diceDiv')
  ROLLSETS[name].forEach( source => {
    const diceSection = create('div', {class: 'roll-section'}, 'diceSection')
    const src = create('div', {class: 'roll-section_title'}, 'src')
    src.textContent = source.title
    const die = create('div', 'die')
    die.textContent = `${source.die}d${source.sides}`
    const amt = create('div', 'amt')
    const rollArray = roll(+source.sides, +source.die)
    const rollReduced = rollArray.reduce( (p,c) => p + c)
    amt.textContent = `${rollArray.toString().split(',').join('+')} = ${rollReduced}`
    total += rollReduced
    history[name].push({[source.title]: {rolls: rollArray, total: rollReduced}})
    diceSection.appendChildren(src, die, amt)
    diceDiv.appendChild(diceSection)
  })
  rollAmt.textContent = total
  rollSection.appendChild(diceDiv)
  if (HISTORY.children.length > 1) HISTORY.insertBefore(rollSection, HISTORY.children[1])
  else HISTORY.appendChild(rollSection)
  ROLLHISTORY.push(history)
  const totalDisplay = create('div', {class: ['roll-section', 'roll-total']}, 'totalDisplay')
  totalDisplay.textContent = total
  ROLL_CONTAINER.appendChild(totalDisplay)
}

function showData() {
  const histRect = HISTORY.getBoundingClientRect()
  const dataDiv = create('div', {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${histRect.width}px`,
    height: `${histRect.height}px`,
    zIndex: 2,
    backgroundColor: 'tomato',
    display: 'flex'
  }, 'dataDiv')
  const jsonBox = create('textarea', {width: '90%', height: '100%'},'jsonBox')
  const closeJson = create('div', 'closeJson')
  closeJson.addIcon('times')
  jsonBox.textContent = JSON.stringify(COMPLETE_DATA)
  dataDiv.appendChildren(jsonBox, closeJson)
  HISTORY.appendChild(dataDiv)
}

