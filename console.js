var c = document.getElementById("console");
var ctx = c.getContext("2d");
font = '18pt clacon'
ctx.font = font;
var charWidth = 13
var charHeight = charWidth * 1.9
var cmd = "";
var user = "guest"
var host = "labienus.dev"
var darkAmber = '#FFB000'
var lightAmber = '#FFCC00'
var darkGreen = '#33FF33'
var lightGreen = '#9fff9f'
var shadowBlur = 15
var blue = "#0b71ff"
var gray = "#9ea1aa"
var dark = "#0c0c0c"
var color = darkGreen
var shadowColor = darkGreen
var xmargin = 15
var preWidth = charWidth * (user.length + host.length + 5) + xmargin;
var y = 0
var cheight = document.getElementById("stage").offsetHeight
var cwidth = document.getElementById("stage").offsetWidth
c.width = cwidth
c.height = cheight
var initialAlpha = 0.8
var da = 0.03

var cc = document.getElementById("carat")
var cctx = cc.getContext('2d')
cc.width = cwidth
cc.height = cheight

var f = document.getElementById("fade")
var ftx = f.getContext('2d')
f.width = cwidth
f.height = cheight

var fading = []
function persist() {
	ftx.clearRect(0, 0, cwidth, cheight)
	for (let i = 0; i < fading.length; i++) {
		let fader = fading[i]
		ftx.globalAlpha = fader.alpha
		if (fader.alpha > 0) {
			fader.alpha -= da
			if (fader.type == 'text') {
				ftx.fillText(fader.s, fader.x, fader.y)
			} else if (fader.type == 'canvas') {
				ftx.drawImage(fader.canvas, 0, 0)
			} else if (fader.type == 'rect') {
				ftx.fillRect(fader.x, fader.y, fader.w, fader.h)
			}
		}
	}
	fading = fading.filter(fader => fader.alpha > 0);
}

var scanlineY = 0
function sweep() {
	if (scanlineY <= cheight) fading.push({ type: 'rect', x: 0, y: scanlineY, w: cwidth, h: 1, alpha: 0.2 })
	scanlineY += 3
	if (scanlineY >= cwidth + 2000) scanlineY = 0
}

var g = document.getElementById("glow")
var gtx = g.getContext('2d')
g.width = cwidth
g.height = cheight

function animate() {
	persist()
	glow()
	noise()
	sweep()
	requestAnimationFrame(animate)
}

function glow() {
	gtx.clearRect(0, 0, cwidth, cheight)
	gtx.shadowBlur = shadowBlur
	gtx.shadowColor = shadowColor
	gtx.drawImage(c, 0, 0)
	gtx.drawImage(f, 0, 0)
	gtx.drawImage(cc, 0, 0)
	gtx.globalCompositeOperation = 'destination-out'
	gtx.shadowBlur = 0
	gtx.drawImage(c, 0, 0)
	gtx.drawImage(f, 0, 0)
	gtx.drawImage(cc, 0, 0)
	gtx.globalCompositeOperation = 'source-over'
}

var n = document.getElementById("noise")
var ntx = n.getContext('2d')
n.width = cwidth
n.height = cheight;
var shift = 1
var missedRowChance = 0.001
var missedColumnChance = 0.01

function noise() {
	const imageData = ctx.getImageData(0, 0, cwidth, cheight)
	const textPixels = new Uint32Array(imageData.data.buffer)
	const noisePixels = new Uint32Array(textPixels.length)
	for (let y = 0; y < cheight; y++) {
		if (Math.random() < missedRowChance) {
			const sourceIndex = y * cwidth
			Math.random() < 0.5 ? noisePixels.set(textPixels.subarray(sourceIndex, sourceIndex + cwidth), sourceIndex) : noisePixels.fill(0x12121200, sourceIndex, sourceIndex+cwidth)
		}

		for (let x = 0; x < cwidth; x++) {
			if (Math.random() < missedColumnChance) {
				const sourceIndex = y * cwidth + x
				const targetIndex = Math.random() < 0.5 ? y * cwidth + (x + shift) : y * cwidth + (x - shift)
				noisePixels[targetIndex] = textPixels[sourceIndex]
			}
		}
	}
	imageData.data.set(new Uint8ClampedArray(noisePixels.buffer));
	ntx.putImageData(imageData, 0, 0);
}

ctx.imageSmoothingEnabled = false
ctx.fillStyle = cctx.fillStyle = ftx.fillStyle = color
ctx.font = cctx.font = ftx.font = font


window.addEventListener("load", main);
function main() {

	title()
	animate()
	window.addEventListener("keydown", type);

}

var db = new OffscreenCanvas(cwidth, cheight)
dbx = db.getContext('2d')
dbx.fillStyle = color
dbx.font = font
var screen = ''
var dx = xmargin
var dy = 0

function type(e) {
	if (e.keyCode == '32') { //spacebar
		e.preventDefault()
	}

	if ((e.key === 'Backspace')) {
		if (x > preWidth) {
			decarat()
			x -= charWidth;

			screen = screen.slice(0, -1)
			for (let i = 0; i < screen.length; i++) {
				let char = screen[i]
				if (char == '\n') {
					dx = xmargin
					dy += charHeight
				} else {
					dbx.fillText(char, dx, dy)
					dx += charWidth
				}
			}
			dx = xmargin
			dy = 0

			ctx.clearRect(0, 0, cwidth, cheight)
			ctx.globalCompositeOperation = 'copy'
			ctx.drawImage(db, 0, 0)
			ctx.globalCompositeOperation = 'source-over'
			dbx.clearRect(0, 0, cwidth, cheight)

			cmd = cmd.slice(0, -1)
			carat()
		}

	} else if (e.key == 'Enter') {
		decarat()
		cmd = cmd.replace(/\r?\n|\r/, "")
		switch (cmd) {
			case '':
				execute(
					function () {
						displaypre()
					}
				)
				break
			case 'labienus':
				title()
				break
			case 'clear':
				let s = new OffscreenCanvas(cwidth, cheight)
				let stx = s.getContext('2d')
				stx.drawImage(c, 0, 0)
				fading.push({ type: 'canvas', canvas: s, alpha: initialAlpha })

				ctx.clearRect(0, 0, cwidth, cheight)
				screen = ''
				y = 0
				displaypre()
				break
			case 'help':

				execute(
					function () {
						displayln("Currently implemented commands:\n\tclear\n\thelp\n\twasm\n\tlabienus")
						displaypre()
					}
				)

				break
			case 'wasm':
				var importObject = { imports: { imported_func: arg => display } };
				WebAssembly.instantiateStreaming(fetch('program.wasm'), importObject)
					.then(obj => {
						var charArray = new Int8Array(
							obj.instance.exports.memory.buffer, //WASM Memory
							obj.instance.exports.getString(),
							12 //string length
						)

						//ASCII to CHAR
						let string = String.fromCharCode.apply(null, charArray)

						execute(
							function () {
								displayln(string)
								displaypre()
							}
						)
					})

				break

			case 'wasm2':
				var wasmModule = new WebAssembly.Module(wasmCode)
				var wasmInstance = new WebAssembly.Instance(wasmModule,wasmIm)
			default:
				execute(
					function () {
						displayln("Type \"help\" for some sample commands.")
						displaypre()
					}
				)
				break
		}
		cmd = ""

	} else if (e.key != "Shift" && e.key != "Control") {
		decarat()
		display(e.key)
		carat()
		cmd += e.key;
	}
}

var wasmCode = new Uint8Array([0,97,115,109,1,0,0,0,1,144,128,128,128,0,3,96,1,127,1,127,96,0,1,127,96,2,127,127,1,127,2,182,128,128,128,0,4,3,101,110,118,6,109,97,108,108,111,99,0,0,3,101,110,118,6,115,116,114,99,97,116,0,2,3,101,110,118,7,115,116,114,99,111,112,121,0,2,3,101,110,118,6,115,116,114,108,101,110,0,0,3,130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,155,128,128,128,0,2,6,109,101,109,111,114,121,2,0,14,112,114,111,99,101,115,115,95,115,116,114,105,110,103,0,4,10,163,128,128,128,0,1,157,128,128,128,0,1,1,127,32,0,16,3,65,10,106,16,0,34,1,65,16,16,2,26,32,1,32,0,16,1,26,32,1,11,11,144,128,128,128,0,1,0,65,16,11,10,112,114,111,99,101,115,115,58,32,0]);


var residue = false
function display(s) {
	screen += s
	for (let i = 0; i < s.length; i++) {
		let char = s[i]
		if (char == '\n') {
			x = xmargin
			y += charHeight

			if (y >= cheight) {
				residue = true
				let li = screen.indexOf("\n", 1)
				screen = screen.substring(li)
				ctx.clearRect(0, 0, cwidth, charHeight + 4)
				ctx.globalCompositeOperation = 'copy'
				ctx.drawImage(c, 0, -charHeight)
				ctx.globalCompositeOperation = 'source-over'
				y -= charHeight
			}

		} else {
			ctx.fillText(char, x, y)
			x += charWidth
		}
	}
}

function execute(fun) {
	let s = new OffscreenCanvas(cwidth, cheight)
	let stx = s.getContext('2d')
	stx.drawImage(c, 0, 0)
	fun()
	if (residue == true) {
		fading.push({ type: 'canvas', canvas: s, alpha: initialAlpha })
		residue = false
	}
}

function displayln(s, fadeCarat) {
	display('\n' + s, fadeCarat)
}

function displaypre() {
	displayln(user + '@' + host + ':~$ ')
	carat()
}

function carat() {
	cctx.fillText('█', x, y)
}

function blink() {
	setBlink = 'on'
	setInterval(() => {
		if (setBlink == 'on') {
			setBlink = 'off'
			carat()
		} else {
			setBlink = 'on'
			decarat()
		}
	}, 500)
}

function decarat() {
	cctx.clearRect(0, 0, cwidth, cheight)
	fading.push({ type: 'text', s: '█', x, y, alpha: initialAlpha })
}

function decaratzero() {
	fading.push({ type: 'text', s: '█', x: 0, y, alpha: initialAlpha })
}

function title() {

	execute(function () {
		displayln(' ')
	})

	setTimeout(() => {
		execute(function () {
			displayln('  █╗    ██╗ ╔██╗ ███╗███╗█╗ █╗█╗ █╗███╗')
			decaratzero()
		})
	}, 250)

	setTimeout(() => {
		execute(function () {
			displayln('  █║   █╬═█╗█═█║  █╣ █╬═ ██╗█║█╣ █╣█╣      █╗')
			decaratzero()
		})
	}, 500)

	setTimeout(() => {
		execute(function () {
			displayln('  █║   ████║████╗ █╣ ███║████║█╣ █╣███╗  ▄▄█╣█▀█╗█╣█╗')
			decaratzero()
		})
	}, 750)

	setTimeout(() => {
		execute(function () {
			displayln('  █║   █╬═█║█╬═█║ █║ █╬═╝█╬██║█╣ █╣╚═█╣  █ █╣█▀▀╩█╣█╣')
			decaratzero()
		})
	}, 1000)

	setTimeout(() => {
		execute(function () {
			displayln('  ╚███╗█║ █║████╬███║███╗█║╠█║████╣███╣█╗███╣███╗ █╣')
			decaratzero()
		})
	}, 1250)

	setTimeout(() => {
		execute(function () {
			displayln('  ╚══╩╩╩╝ ╚╩╩══╩╩╩═╩╩╩══╩╩╝╚╩╩╩══╩╩╩═╩═╩╩╩══╩╩═╩╩═╩╩')
			decaratzero()
		})
	}, 1500)

	setTimeout(function () {
		let d = new Date()
		execute(
			function () {
				displayln('')
				displayln(d.getUTCDate() + '-' + d.getUTCMonth() + '-' + d.getUTCFullYear())
				displayln(d.getUTCHours() + ':' + (('0' + d.getUTCMinutes()).slice(-2)) + " UTC")
			},
		)
	}, 1600)
	setTimeout(() => {
		execute(
			function () {
				displaypre()
			}
		)
	}, 2100)

}