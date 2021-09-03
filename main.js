// MY USEFUL FUNCTIONS

// query selector: returns Nodelist if multiple elements or single Node if single element
const q = ele => document.querySelectorAll(ele).length > 1 ? document.querySelectorAll(ele) : document.querySelector(ele)

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
          console.log(e.classList)
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

// Edit or Save 'constant'
let EDITSAVE = 0

// ELEMENT CONSTANTS
const CONTAINER = q('#roll-container')
const EDITSAVEBUTTON = q('#editsave')

// Add roll set div
const addRollSet = () => {
  // Container for new roll set
  const newRollSet = create('div')
  newRollSet.id = 'new-roll-set'
  // Container for buttons
  const buttonDiv = create('div', {width: '100%', height: '35px'})
  const addDamageSourceButton = create('div', {width: '40%', height: '35px', textAlign: 'center'})
  addDamageSourceButton.textContent = 'Add Damage Source'
  addDamageSourceButton.onclick = () => addDamageSource(newRollSet)
  const saveRollSetButton = create('button')
  saveRollSetButton.textContent = 'Save Roll Set'
  const cancelRollSetButton = create('button')
  cancelRollSetButton.textContent = 'Cancel'
  appendChildren(buttonDiv, addDamageSourceButton, saveRollSetButton, cancelRollSetButton)
  newRollSet.appendChild(buttonDiv)
  CONTAINER.appendChild(newRollSet)
}

// Add damage source div
const addDamageSource = (rollSetContainer) => {
  const dmgContainer = create('div', {class: 'damage-source', width: '100%', height: '55px'})
  const dmgTitle = create('input', {class: 'damage-input', type: 'text', display: 'block'})
  dmgTitle.placeholder = 'Damage Source'
  const dieNum = create('input', {class: 'tiny-input'})
  const literallyTheLetterD = create('span')
  literallyTheLetterD.textContent = 'd'
  const dieSides = create('input', {class: 'tiny-input'})

  appendChildren(dmgContainer, dmgTitle, dieNum, literallyTheLetterD, dieSides)

  rollSetContainer.appendChild(dmgContainer)
}

// Edit or Save depending on situation
const editSave = () => {
  if (!EDITSAVE) {
    EDITSAVEBUTTON.textContent = 'Edit'
    EDITSAVE = 1
    q('input').forEach(i => {
      i.disabled = true
      if (i.classList.contains('damage-input')) i.classList.add('ds-disabled')
      else i.classList.add('dr-disabled')
    })
  } else {
    EDITSAVEBUTTON.textContent = 'Save'
    EDITSAVE = 0
    q('input').forEach(i => {
      i.disabled = false
      if (i.classList.contains('damage-input')) i.classList.remove('ds-disabled')
      else i.classList.remove('dr-disabled')
    })
  }
}