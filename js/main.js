let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

var canvas = document.getElementById("canvas_1");
var select_color = document.getElementById("colorpicker");
var size = 1;
var canvas_left = 0;
var canvas_top  = 0;
var mx = 0;
var my = 0;
var pre_x = 0;
var pre_y = 0;
var posx = 0;
var posy = 0;
var select = false;
var timerMetamask;
var colorArray = [		
'#ffffff', '#c4c4c4', '#555555', '#222222', '#000001',
'#fca6cf', '#cc70df', '#e815e6', '#690005', '#e10015',
'#fb271f', '#e3912c', '#e5d63f', '#fedece', '#9e6847',
'#623a23', '#98df5a', '#5de042', '#29bd31', '#116616',
'#2cd5db', '#41befa', '#1687c3', '#0657f8', '#0028e3'];
canvas_context = canvas.getContext("2d");
pole = document.createElement('canvas')
poleContext = pole.getContext('2d');
pole.width = 1024;
pole.height = 1024;
canvas_context.fillStyle = "#000000";
canvas_context.strokeStyle = "#000000";
canvas.addEventListener('contextmenu', doContextMenu, true);
canvas.addEventListener("mousewheel", doWheel, false);
canvas.addEventListener('mousedown', doMouseDown, true);
canvas.addEventListener('mouseup', doMouseUp, true);
canvas.addEventListener('mousemove', doMouseMove, true);
canvas.addEventListener("touchstart", doTouchStart, false);
canvas.addEventListener("touchmove", doTouchMove, false);
window.addEventListener('resize', doResize, false);
window.onscroll = function () { window.scrollTo(0, 0); };
generatePalette(document.getElementById("palette"));
createPole();
doResize();

var work = false;
var pogress = 0;
var contract;
var metamask_exists = false;
var waitpanel = document.getElementById('waitpanel');
MetamaskCheck();

function waitConfirm(txHash, wait_count, func_true, func_false) {
	let timerConfirm = setTimeout(function tick() { web3.eth.getTransactionReceipt(txHash, function(err,tx){
			wait_count--;
			if ( !err && wait_count > 0 && tx == null ) {
				console.log('Wite Confirm: '+wait_count);
				timerConfirm = setTimeout(tick, 1000);
			} else { if (!err) {
				if ( tx.status == '0x0' || wait_count == 0 ) { func_false() } else
				if ( tx.status == '0x1') {
					web3.eth.getBlockNumber(function (err, _blockNumber) { if(!err) {
						//console.log('Wite Confirm: '+wait_count + 'now blockNumber: '+_blockNumber + 'tx blockNumber: '+tx.blockNumber);
						if ( _blockNumber <= tx.blockNumber ) { timerConfirm = setTimeout(tick, 1000) } else func_true()
					} })
				}
			}}
	}) }, 1000);	
}

function MetamaskCheck(){
	//Проверка наличия метамаска
	if (typeof web3 !== "undefined") {
		window.web3 = new Web3(window.ethereum);
		ethereum.enable();
		contract = web3.eth.contract(contract_abi).at(contract_address);
		metamask_exists = true;
		MetamaskGetBlocksNum(true);
	} else {
		drawPole();
	}
}

function MetamaskGetBlocksNum(get_all_pixels) {
	web3.eth.getBlockNumber(function (err, blockchain_block_num) {
		if(!err) {
			contract.block_number(web3.eth.accounts[0], function(err, acc_block_num){
				console.log("wait "+(23-(Number(blockchain_block_num)-Number(acc_block_num)))+" blocks");
				if (!err && (Number(blockchain_block_num)-Number(acc_block_num)) < 23) {
					waitpanel.innerHTML = "wait "+(23-(Number(blockchain_block_num)-Number(acc_block_num)))+" blocks";
					waitpanel.style.display = "block";
				} else {
					waitpanel.style.display = "none";
					waitpanel.innerHTML = "";
				}
				if ( get_all_pixels == true ) { for(let i = 0; i < 512; i++) MetamaskGetPole(i*2048,2048) }
			} );
		} else {
			if ( get_all_pixels == true ) { for(let i = 0; i < 512; i++) MetamaskGetPole(i*2048,2048) }
		}
	});
}

function MetamaskGetPole(_cursor,_howMany) {
	if ( metamask_exists == true ) {
		contract.get_Pole_(_cursor,_howMany,function(err, _data) {
			if ( _howMany == 1 ) {
				work = false
			} else {
				pogress += _howMany
			};
			
			if (!err) {
				for (var i = 0; i < _howMany; ++i) {
					if ( typeof _data[i] !== "undefined" ) {
						poleContext.fillStyle = '#ffffff';
						if ( String(_data[i]).length>6 && _data[i] != "0X000000" && _data[i] != "0x000000" ) {
							poleContext.fillStyle = "#"+_data[i][2]+_data[i][3]+_data[i][4]+_data[i][5]+_data[i][6]+_data[i][7];
						}
						
						x = (_cursor + i) - (Math.floor( (_cursor + i) / 1024 ) * 1024);
						y = Math.floor( (_cursor + i) / 1024 );
						poleContext.fillRect(x,y,1,1);
					}
				}	
				drawPole();
			}
			
			if ( pogress == 1048576 ) {
				console.log('MetamaskGetPole');
				pogress = 0;
				MetamaskGetBlocksNum(false);
				timerMetamask = setTimeout(onTimerMetamask, 30000);
			}
		} );
	}
}

function Metamask_doPaint(_x, _y) {
	if ( metamask_exists == true ) {
		var _index = _x + _y * 1024;
		var _color = select_color.value;
		var _bytes = "0x" +
		_color[1] +
		_color[2] +
		_color[3] +
		_color[4] +
		_color[5] +
		_color[6]; 
		contract.doPaint(_index, _bytes,{from: web3.eth.accounts[0], value: document.getElementById('edit').value * 1000000000000000000}, function(err, txHash){
			if (!err) {
				poleContext.fillStyle = select_color.value;
				poleContext.fillRect(_x,_y,1,1);
				waitpanel.innerHTML = "wait confirm";
				waitpanel.style.display = "block";
				waitConfirm(txHash, 100,
					function confirmTrue() {
						waitpanel.innerHTML = "wait 23 blocks";
						waitpanel.style.display = "block";
						MetamaskGetPole(_index,1)
					},
					function confirmFalse() {
						work = false;
						waitpanel.style.display = "none";
					}
				)
			} else {
				work = false;
			}
		});
	}
}

function onTimerMetamask() {
	for(let i = 0; i < 512; i++) MetamaskGetPole(i*2048,2048);
}	

function createPole() {
	poleContext.fillStyle = "#FFFFFF";
	poleContext.fillRect(0, 0, 1024, 1024);
	drawPole()
}

function RGBToHex(rgb) {
	let sep = rgb.indexOf(",") > -1 ? "," : " ";
	rgb = rgb.substr(4).split(")")[0].split(sep);
	let r = (+rgb[0]).toString(16),
	g = (+rgb[1]).toString(16),
	b = (+rgb[2]).toString(16);
	if (r.length == 1) r = "0" + r;
	if (g.length == 1) g = "0" + g;
	if (b.length == 1) b = "0" + b;
	return "#" + r + g + b;
}

function generatePalette(palette) {
	select_color.value = "#"+(Math.round(Math.random() * 0XFFFFFF)).toString(16);
	for (var i = 0; i < 25; i++) {
		var paletteBlock = document.createElement('div');
		paletteBlock.className = 'button';
		paletteBlock.addEventListener('click', function changeColor(e) {
			select_color.value = RGBToHex(e.target.style.backgroundColor);
		});
		paletteBlock.style.backgroundColor = colorArray[i];
		palette.appendChild(paletteBlock);
	}
}

function doWheel(e) {
	var delta = ( e.deltaY || e.detail || e.wheelDelta ) / (1024/size);
	doSize(delta, true);
}

function doSize(delta, repos) {
	var oldsize = size;
	if ( repos == false )  delta = delta / (1024/size);
	if ( size - delta > 0.2 && size - delta < 100 ) size -= delta;
	if ( size != oldsize ) {
		if ( repos == true ){
			posx += (delta * ( (event.clientX - posx)/oldsize ) );
			posy += (delta * ( (event.clientY - posy)/oldsize ) );
		} else {
			posx += (delta * ( (canvas.width / 2 - posx)/oldsize ) );
			posy += (delta * ( (canvas.height / 2 - posy)/oldsize ) );
		}
		drawPole();
	}
}

function drawPole() {			
	canvas_context.fillStyle = "#f7f7f7";
	canvas_context.fillRect(0, 0, canvas.width, canvas.height);
	canvas_context.save();
	canvas_context.translate( posx, posy );
	canvas_context.scale( size, size );
	canvas_context.mozImageSmoothingEnabled = false;
	canvas_context.webkitImageSmoothingEnabled = false;
	canvas_context.msImageSmoothingEnabled = false;
	canvas_context.imageSmoothingEnabled = false;
	canvas_context.drawImage(pole, 0, 0);
	canvas_context.fillStyle = select_color.value;
	canvas_context.fillStyle = select_color.value;
	if ( pre_x >= 0 && pre_y >= 0 && pre_x < 1024 && pre_y < 1024 )
	canvas_context.fillRect(pre_x, pre_y, 1, 1);
    canvas_context.restore();	
	
	if ( metamask_exists == false ) {
		canvas_context.textAlign='center';
		canvas_context.font = "42px Courier New";
		canvas_context.fillStyle = "#000000";
		canvas_context.fillText("NEED METAMASK", canvas.width / 2, 70);
	}
}

function doContextMenu(e) {
	e.preventDefault();
}

function doTouchStart(e){
	if ( e.changedTouches.length == 1 ) {
		mx = e.changedTouches[0].pageX;
		my = e.changedTouches[0].pageY;
		select = true;		
	}
}

function doTouchMove(e){
	if ( e.changedTouches.length == 1 ) {
		select = false;
		posx -= (mx-e.changedTouches[0].pageX);
		posy -= (my-e.changedTouches[0].pageY);
		mx = e.changedTouches[0].pageX;
		my = e.changedTouches[0].pageY;
		if ( work == false ) {
			pre_x = Math.floor( (event.clientX - canvas_left - posx)/size );
			pre_y = Math.floor( (event.clientY - canvas_top  - posy)/size ); 
		}
		drawPole();
	}
}

function doMouseDown(e){
	mx = e.x;
	my = e.y;
	select = true;
}

function doMouseUp(e){
	if (select == true) {
		var px = Math.floor( (event.clientX - canvas_left - posx)/size );
		var py = Math.floor( (event.clientY - canvas_top  - posy)/size );
		if ( px >= 0 && px <= 1024 && py >= 0 && py <= 1024 ) {
			if ( work == false ) {
				if ( e.button == 0 ) {
					work = true;
					Metamask_doPaint(px,py);
					drawPole();
				} else
				if ( e.button == 1 ) {
					var isPixel = poleContext.getImageData(px, py, 1, 1);
					select_color.value = RGBToHex("rgb(" + isPixel.data[0] + "," + isPixel.data[1] + "," + isPixel.data[2] + ")"); 
				}
			}
			select = false;
		}
	}
}

function doMouseMove(e){
	if ( e.buttons == 1 ) {
		select = false;
		posx -= (mx-e.x);
		posy -= (my-e.y);
		mx = e.x;
		my = e.y;
	}
	if ( work == false ) {
		pre_x = Math.floor( (event.clientX - canvas_left - posx)/size );
		pre_y = Math.floor( (event.clientY - canvas_top  - posy)/size ); 
	}
	drawPole();
}

function doResize() {
	var realToCSSPixels = window.devicePixelRatio;
	var displayWidth  = Math.floor( canvas.clientWidth  * realToCSSPixels);
	var displayHeight = Math.floor( canvas.clientHeight * realToCSSPixels);
	if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
		canvas.width  = displayWidth;
		canvas.height = displayHeight;
	}
	
	if ( posx == 0 && posy == 0 ) {
		posx = (canvas.width - 1024) / 2;
		posy = (canvas.height - 1024) / 2;
	}
	drawPole();
}