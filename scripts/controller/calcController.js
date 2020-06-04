class CalcController {
    constructor() {

        this._audio = new Audio('click.mp3')
        this._audioOnOff = false
        this._lastOperator = ''
        this._lastNumber - ''
        this._operation = [];
        this._locale = 'pt-BR'
        this._displayCalcEl = document.querySelector("#display")
        this._dataEL = document.querySelector("#data")
        this._horaEl = document.querySelector("#hora")
        this._dataAtual;
        this.initialize()
        this.initiButtonsEvents()
        this.initKeyboard()
    }

    addEventListenerAll(elements, events, fn) {

        events.split(' ').forEach(event => {
            elements.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        this._operation = []
        this._lastNumber = ''
        this._lastOperator = ''
        this.setLastNumberToDisplay()

    }

    clearEntry() {
        this._operation.pop()
        this.setLastNumberToDisplay()

    }

    getLastOperation() {
        return this._operation[this._operation.length - 1]
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1)
    }

    pushOperator(value) {
        this._operation.push(value)
        if (this._operation.length > 3) {

            this.calc()
        }
    }

    getResult() {


        try{
            return eval(this._operation.join(""))
        }catch (e){
            setTimeout(()=>{
                this.setError()
            },1)
            
        }
        
    }

    calc() {

        let last = ''
        this._lastOperator = this.getLastItem()

        if (this._operation.length < 3) {
            let firstItem = this._operation[0]
            this._operation = [firstItem, this._lastOperator, this._lastNumber]
        }

        if (this._operation.length > 3) {
            last = this._operation.pop()
            this._lastNumber = this.getResult()

        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false)
        }
        let result = this.getResult()

        if (last == "%") {
            result /= 100
            this._operation = [result]
        } else {
            this._operation = [result]
            if (last) this._operation.push(last)
        }
        this.setLastNumberToDisplay()
    }

    getLastItem(isOperator = true) {
        let lastItem
        for (let i = this._operation.length - 1; i >= 0; i--) {
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i]
                break;
            }

        }
        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber
        }

        return lastItem
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false)

        if (!lastNumber) lastNumber = 0
        this.displayCalc = lastNumber
    }

    addOperation(value) {

        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            } else {
                this.pushOperator(value);

                this.setLastNumberToDisplay()
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperator(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString()
                this.setLastOperation(newValue)

                this.setLastNumberToDisplay()
            }

        }

    }

    setError() {
        this.displayCalc = "Error"
    }

    addDot() {
        let lastOperation = this.getLastOperation()

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperator('0.')
        } else {
            this.setLastOperation(lastOperation.toString() + '.')
        }
        this.setLastNumberToDisplay()
    }

    execBtn(value) {
        this.playAudio()
        switch (value) {
            case 'ac':
                this.clearAll()
                break;
            case 'ce':
                this.clearEntry()
                break;
            case 'soma':
                this.addOperation('+')
                break;
            case 'subtracao':
                this.addOperation('-')
                break;
            case 'multiplicacao':
                this.addOperation('*')
                break;
            case 'divisao':
                this.addOperation('/')
                break;
            case 'porcento':
                this.addOperation('%')
                break;
            case 'igual':
                this.calc()
                break;
            case 'ponto':
                this.addDot()
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value))
                break;
            default:
                this.setError()
                break;

        }
    }

    initiButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach(btn => {
            this.addEventListenerAll(btn, 'click drag', e => {
                let textBtn = btn.className.baseVal.replace("btn-", "")
                this.execBtn(textBtn);
            });
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer"
            })
        })
    }

    pasteFromClipboard() {
        document.addEventListener('paste', e => {
            let texto = e.clipboardData.getData('Text')

            this.displayCalc = parseFloat(texto)
        })
    }

    copyToClipboard() {

        let input = document.createElement('input')

        input.value = this.displayCalc

        document.body.appendChild(input)

        input.select()

        document.execCommand("Copy")

        input.remove()


    }
    initialize() {
        this.setDisplayDataHora()
        setInterval(() => {
            this.displayData = this.dataAtual.toLocaleDateString(this._locale, {
                day: "2-digit", //Para editar a formatação da data
                month: "long",
                year: "numeric"
            })
            this.displayHora = this.dataAtual.toLocaleTimeString(this._locale)
        }, 1000);
        // FUNÇÃO PARA PARAR OU INICIAR ALGUMA COISA
        // setTimeOut(() =>{ 
        //     clearInterval(interval)
        // },10000)

        this.setLastNumberToDisplay()

        this.pasteFromClipboard()

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio()
            })
        })
    }

    toggleAudio() {

        this._audioOnOff = !this._audioOnOff
    }

    playAudio() {
        if(this._audioOnOff){
            this._audio.currentTime = 0
            this._audio.play()
        }
    }

    initKeyboard() {
        document.addEventListener('keyup', e => {

            this.playAudio()

            switch (e.key) {
                case 'Escape':
                    this.clearAll()
                    break;
                case 'Backspace':
                    this.clearEntry()
                    break;
                case '+':
                    this.addOperation(e.key)
                    break;
                case '-':
                    this.addOperation(e.key)
                    break;
                case '*':
                    this.addOperation(e.key)
                    break;
                case '/':
                    this.addOperation(e.key)
                    break;
                case '%':
                    this.addOperation(e.key)
                    break;
                case 'Enter':
                case '=':
                    this.calc()
                    break;
                case ',':
                case '.':
                    this.addDot()
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key))
                    break;
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard()
                    break;
            }
        })
    }

    setDisplayDataHora() {
        this.displayData = this.dataAtual.toLocaleDateString(this._locale)
        this.displayHora = this.dataAtual.toLocaleTimeString(this._locale)
    }


    get displayHora() {
        return this._horaEl.innerHTML
    }

    set displayHora(hora) {
        return this._horaEl.innerHTML = hora
    }

    get displayData() {
        return this._dataEL.innerHTML
    }

    set displayData(data) {
        return this._dataEL.innerHTML = data
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML
    }

    set displayCalc(valor) {

        if(valor.toString().length > 10){
            this.setError()
            return false
        }
        this._displayCalcEl.innerHTML = valor
    }

    get dataAtual() {
        return new Date();
    }

    set dataAtual(data) {
        this._dataAtual = data
    }
}
