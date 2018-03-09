//websocket推送方法
wsFn() {
	let that = this,
		baseInfo = that.$store.state.baseInfo,
		url = "ws://aicy.openspeech.cn/websocket/";
	if("WebSocket" in window) {
		let ws = new WebSocket(url + baseInfo.memberId),
			sot = null;
		ws.keepalive = function() {
			let time = new Date().getTime();
			// 如果断网了，ws.send会无法发送消息出去。ws.bufferedAmount不会为0。
			if(ws.bufferedAmount === 0 && ws.readyState === 1) {
				let req = {
					"data": {
						"numberKey": baseInfo.memberId,
						//frontmsgType,0:，1:心跳，2:
						"fmt": 1
					}
				}
				ws.send(JSON.stringify(req));
			}
		}
		if(ws) {
			let reconnect = 0, //重连的时间
				reconnectMark = false; //是否重连过
			ws.onopen = function() {
				reconnect = 0;
				reconnectMark = false;
				if(ws.readyState === 1) { // 为1表示连接处于open状态
					ws.keepalive();
					ws.keepAliveTimer = setInterval(function() {
						ws.keepalive();
					}, 60000)
				}
			}
			ws.onmessage = function(evt) {
				console.log(555555555)
				let received_msg = JSON.parse(evt.data);
				if(received_msg.msgType == 0) {
					if(received_msg.data.numberKey == baseInfo.memberId && received_msg.data.status == 1) {
						console.log(222222)
						//要做的事情
						...
					}
				}
			}
			ws.onerror = function(e) {
				console.error('onerror');
			}
			ws.onclose = function() {
				console.log("onclose连接已关闭...");
				clearInterval(ws.keepAliveTimer);
				if(!reconnectMark) { // 如果没有重连过，进行重连。
					reconnect = new Date().getTime();
					reconnectMark = true;
				}
				let tempWs = ws; // 保存ws对象
				if(!window.navigator.onLine) {
					ws.close();
				} else {
					//非断网情况下
					if(new Date().getTime() - reconnect >= 5000) { // 5秒中重连，连不上就不连了
						ws.close();
						sot = setTimeout(function() {
							ws.close();
							that.wsFn();
							clearTimeout(sot);
						}, 60000)
					} else {
						ws = new WebSocket(url + baseInfo.memberId);
						ws.onopen = tempWs.onopen;
						ws.onmessage = tempWs.onmessage;
						ws.onerror = tempWs.onerror;
						ws.onclose = tempWs.onclose;
						ws.keepalive = tempWs.keepalive;
					}
				}
			}
		}
		//	网络波动情况下,情况下导致webSocket的问题
		window.addEventListener("online", function() {
			clearTimeout(sot);
			ws.close();
			that.wsFn();
		}, true);
		window.addEventListener("offline", function() {
			ws.close();
		}, true);
	}
}
}
