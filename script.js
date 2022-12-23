class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement
        this.currentOperandTextElement = currentOperandTextElement
        this.clear()

        if (localStorage.getItem('calc-history') === null) this.clearHistory()
    }

    clearHistory() {
        localStorage.setItem('calc-history', '{[]}')
    }

    getHistory() {
        try {
            let history = JSON.parse(localStorage.getItem('calc-history'))
            if (!(history instanceof Array)) {
                return []
            }
            return history
        } catch (e) {
            return []
        }
    }

    appendHistory(previousOperand, currentOperand, operation, computation) {
        let history = this.getHistory()
        history.push([previousOperand, currentOperand, operation, computation])
        localStorage.setItem('calc-history', JSON.stringify(history))
    }

    clear() {
        this.currentOperand = ''
        this.previousOperand = ''
        this.operation = undefined
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1)
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return
        if (this.currentOperand.length >= 10) return
        this.currentOperand = this.currentOperand.toString() + number.toString()
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return
        if (this.previousOperand !== '') {
            this.compute()
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
    }

    compute() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current)) return
        switch (this.operation) {
            case '+':
                computation = prev + current
                break
            case '-':
                computation = prev - current
                break
            case '*':
                computation = prev * current
                break
            case '÷':
                computation = prev / current
                break
            default:
                return
        }
        this.appendHistory(this.previousOperand, this.currentOperand, this.operation, computation)
        this.currentOperand = computation
        this.operation = undefined
        this.previousOperand = ''
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString()
        const integerDigits = parseFloat(stringNumber.split('.')[0])
        const decimalDigits = stringNumber.split('.')[1]
        let integerDisplay
        if (isNaN(integerDigits)) {
            integerDisplay = ''
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {maximumFractionDigits: 0})
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`
        } else {
            return integerDisplay
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand)
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
        } else {
            this.previousOperandTextElement.innerText = ''
        }
    }

    updateHistory() {
        $('.history').empty()
        this.getHistory().forEach(([prev, curr, oper, comp]) => {
            $('.history').append(`
                            <div><span class="prev">${prev}</span> 
                            <span class="oper">${oper}</span>
                            <span class="curr">${curr}</span>
                            <div class="break"></div>
                            <span class="eq">=</span>
                            <div class="break"></div>
                            <span class="comp">${comp}</span></div>
`)
        })
    }
}


const numberButtons = document.querySelectorAll('[data-number]')
const operationButtons = document.querySelectorAll('[data-operation]')
const equalsButton = document.querySelector('[data-equals]')
const deleteButton = document.querySelector('[data-delete]')
const allClearButton = document.querySelector('[data-all-clear]')
const previousOperandTextElement = document.querySelector('[data-previous-operand]')
const currentOperandTextElement = document.querySelector('[data-current-operand]')

const historyButton = $('.history-button')
const downloadHistoryButton = $('.download-history')
const sendHistoryButton = $('.send-history')
const clearHistoryButton = $('.clear-history')

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText)
        calculator.updateDisplay()
    })
})

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText)
        calculator.updateDisplay()
    })
})

equalsButton.addEventListener('click', () => {
    calculator.compute()
    calculator.updateDisplay()
})

allClearButton.addEventListener('click', () => {
    calculator.clear()
    calculator.updateDisplay()
})

deleteButton.addEventListener('click', () => {
    calculator.delete()
    calculator.updateDisplay()
})

historyButton.click(function () {
    $('.calculator-grid > button, .history, .output, .download-history, .send-history, .clear-history').toggle()
    calculator.updateHistory()
})

downloadHistoryButton.click(function () {
    let fileName = 'calculation-history.json';

    let fileToSave = new Blob([JSON.stringify(calculator.getHistory())], {
        type: 'application/json'
    });

    saveAs(fileToSave, fileName);
})

sendHistoryButton.click(async function () {
    const shareData = {
        title: 'Calculation History',
        text: JSON.stringify(calculator.getHistory()),
        url: 'https://merlin-sp.github.io/simple-calc/'
    }

    try {
        await navigator.share(shareData);
    } catch (err) {
        alert(`It was error while sharing: ${err}`)
    }
})

clearHistoryButton.click(function () {
    calculator.clearHistory()
    calculator.updateHistory()
})

$('.history, .download-history, .send-history, .clear-history').hide()
