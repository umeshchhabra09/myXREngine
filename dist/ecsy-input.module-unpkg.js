function getName(e){return e.name}function queryKey(e){for(var t=[],n=0;n<e.length;n++){var o=e[n];if("object"==typeof o){var s="not"===o.operator?"!":o.operator;t.push(s+getName(o.Component))}else t.push(getName(o))}return t.sort().join("-")}const hasWindow="undefined"!=typeof window,now=hasWindow&&void 0!==window.performance?performance.now.bind(performance):Date.now.bind(Date);class EventDispatcher{constructor(){this._listeners={},this.stats={fired:0,handled:0}}addEventListener(e,t){let n=this._listeners;void 0===n[e]&&(n[e]=[]),-1===n[e].indexOf(t)&&n[e].push(t)}hasEventListener(e,t){return void 0!==this._listeners[e]&&-1!==this._listeners[e].indexOf(t)}removeEventListener(e,t){var n=this._listeners[e];if(void 0!==n){var o=n.indexOf(t);-1!==o&&n.splice(o,1)}}dispatchEvent(e,t,n){this.stats.fired++;var o=this._listeners[e];if(void 0!==o)for(var s=o.slice(0),i=0;i<s.length;i++)s[i].call(this,t,n)}resetCounters(){this.stats.fired=this.stats.handled=0}}class Query{constructor(e,t){if(this.Components=[],this.NotComponents=[],e.forEach(e=>{"object"==typeof e?this.NotComponents.push(e.Component):this.Components.push(e)}),0===this.Components.length)throw new Error("Can't create a query without components");this.entities=[],this.eventDispatcher=new EventDispatcher,this.reactive=!1,this.key=queryKey(e);for(var n=0;n<t._entities.length;n++){var o=t._entities[n];this.match(o)&&(o.queries.push(this),this.entities.push(o))}}addEntity(e){e.queries.push(this),this.entities.push(e),this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED,e)}removeEntity(e){let t=this.entities.indexOf(e);~t&&(this.entities.splice(t,1),t=e.queries.indexOf(this),e.queries.splice(t,1),this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_REMOVED,e))}match(e){return e.hasAllComponents(this.Components)&&!e.hasAnyComponents(this.NotComponents)}toJSON(){return{key:this.key,reactive:this.reactive,components:{included:this.Components.map(e=>e.name),not:this.NotComponents.map(e=>e.name)},numEntities:this.entities.length}}stats(){return{numComponents:this.Components.length,numEntities:this.entities.length}}}Query.prototype.ENTITY_ADDED="Query#ENTITY_ADDED",Query.prototype.ENTITY_REMOVED="Query#ENTITY_REMOVED",Query.prototype.COMPONENT_CHANGED="Query#COMPONENT_CHANGED";class Component{constructor(e){if(!1!==e){const t=this.constructor.schema;for(const n in t)if(e&&e.hasOwnProperty(n))this[n]=e[n];else{const e=t[n];if(e.hasOwnProperty("default"))this[n]=e.type.clone(e.default);else{const t=e.type;this[n]=t.clone(t.default)}}}this._pool=null}copy(e){const t=this.constructor.schema;for(const n in t){const o=t[n];e.hasOwnProperty(n)&&(this[n]=o.type.copy(e[n],this[n]))}return this}clone(){return(new this.constructor).copy(this)}reset(){const e=this.constructor.schema;for(const t in e){const n=e[t];if(n.hasOwnProperty("default"))this[t]=n.type.copy(n.default,this[t]);else{const e=n.type;this[t]=e.copy(e.default,this[t])}}}dispose(){this._pool&&this._pool.release(this)}}Component.schema={},Component.isComponent=!0;class System{canExecute(){if(0===this._mandatoryQueries.length)return!0;for(let e=0;e<this._mandatoryQueries.length;e++){if(0===this._mandatoryQueries[e].entities.length)return!1}return!0}constructor(e,t){if(this.world=e,this.enabled=!0,this._queries={},this.queries={},this.priority=0,this.executeTime=0,t&&t.priority&&(this.priority=t.priority),this._mandatoryQueries=[],this.initialized=!0,this.constructor.queries)for(var n in this.constructor.queries){var o=this.constructor.queries[n],s=o.components;if(!s||0===s.length)throw new Error("'components' attribute can't be empty in a query");var i=this.world.entityManager.queryComponents(s);this._queries[n]=i,!0===o.mandatory&&this._mandatoryQueries.push(i),this.queries[n]={results:i.entities};var r=["added","removed","changed"];const e={added:Query.prototype.ENTITY_ADDED,removed:Query.prototype.ENTITY_REMOVED,changed:Query.prototype.COMPONENT_CHANGED};o.listen&&r.forEach(t=>{if(this.execute||console.warn(`System '${this.constructor.name}' has defined listen events (${r.join(", ")}) for query '${n}' but it does not implement the 'execute' method.`),o.listen[t]){let s=o.listen[t];if("changed"===t){if(i.reactive=!0,!0===s){let e=this.queries[n][t]=[];i.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED,t=>{-1===e.indexOf(t)&&e.push(t)})}else if(Array.isArray(s)){let e=this.queries[n][t]=[];i.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED,(t,n)=>{-1!==s.indexOf(n.constructor)&&-1===e.indexOf(t)&&e.push(t)})}}else{let o=this.queries[n][t]=[];i.eventDispatcher.addEventListener(e[t],e=>{-1===o.indexOf(e)&&o.push(e)})}}})}}stop(){this.executeTime=0,this.enabled=!1}play(){this.enabled=!0}clearEvents(){for(let t in this.queries){var e=this.queries[t];if(e.added&&(e.added.length=0),e.removed&&(e.removed.length=0),e.changed)if(Array.isArray(e.changed))e.changed.length=0;else for(let t in e.changed)e.changed[t].length=0}}toJSON(){var e={name:this.constructor.name,enabled:this.enabled,executeTime:this.executeTime,priority:this.priority,queries:{}};if(this.constructor.queries){var t=this.constructor.queries;for(let n in t){let o=this.queries[n],s=t[n],i=e.queries[n]={key:this._queries[n].key};if(i.mandatory=!0===s.mandatory,i.reactive=s.listen&&(!0===s.listen.added||!0===s.listen.removed||!0===s.listen.changed||Array.isArray(s.listen.changed)),i.reactive){i.listen={};["added","removed","changed"].forEach(e=>{o[e]&&(i.listen[e]={entities:o[e].length})})}}}return e}}System.isSystem=!0;class TagComponent extends Component{constructor(){super(!1)}}TagComponent.isTagComponent=!0;const copyValue=e=>e,cloneValue=e=>e,copyArray=(e,t)=>{const n=e,o=t;o.length=0;for(let e=0;e<n.length;e++)o.push(n[e]);return o},cloneArray=e=>e.slice(),copyJSON=e=>JSON.parse(JSON.stringify(e)),cloneJSON=e=>JSON.parse(JSON.stringify(e)),copyCopyable=(e,t)=>t.copy(e),cloneClonable=e=>e.clone();function createType(e){var t=["name","default","copy","clone"].filter(t=>!e.hasOwnProperty(t));if(t.length>0)throw new Error("createType expects a type definition with the following properties: "+t.join(", "));return e.isType=!0,e}const Types={Number:createType({name:"Number",default:0,copy:copyValue,clone:cloneValue}),Boolean:createType({name:"Boolean",default:!1,copy:copyValue,clone:cloneValue}),String:createType({name:"String",default:"",copy:copyValue,clone:cloneValue}),Array:createType({name:"Array",default:[],copy:copyArray,clone:cloneArray}),Ref:createType({name:"Ref",default:void 0,copy:copyValue,clone:cloneValue}),JSON:createType({name:"JSON",default:null,copy:copyJSON,clone:cloneJSON})};function generateId(e){for(var t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",o=n.length,s=0;s<e;s++)t+=n.charAt(Math.floor(Math.random()*o));return t}function injectScript(e,t){var n=document.createElement("script");n.src=e,n.onload=t,(document.head||document.documentElement).appendChild(n)}function hookConsoleAndErrors(e){["error","warning","log"].forEach(t=>{if("function"==typeof console[t]){var n=console[t].bind(console);console[t]=(...o)=>(e.send({method:"console",type:t,args:JSON.stringify(o)}),n.apply(null,o))}}),window.addEventListener("error",t=>{e.send({method:"error",error:JSON.stringify({message:t.error.message,stack:t.error.stack})})})}function includeRemoteIdHTML(e){let t=document.createElement("div");return t.style.cssText="\n    align-items: center;\n    background-color: #333;\n    color: #aaa;\n    display:flex;\n    font-family: Arial;\n    font-size: 1.1em;\n    height: 40px;\n    justify-content: center;\n    left: 0;\n    opacity: 0.9;\n    position: absolute;\n    right: 0;\n    text-align: center;\n    top: 0;\n  ",t.innerHTML=`Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${e}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`,document.body.appendChild(t),t}function enableRemoteDevtools(remoteId){if(!hasWindow)return void console.warn("Remote devtools not available outside the browser");window.generateNewCode=()=>{window.localStorage.clear(),remoteId=generateId(6),window.localStorage.setItem("ecsyRemoteId",remoteId),window.location.reload(!1)},remoteId=remoteId||window.localStorage.getItem("ecsyRemoteId"),remoteId||(remoteId=generateId(6),window.localStorage.setItem("ecsyRemoteId",remoteId));let infoDiv=includeRemoteIdHTML(remoteId);window.__ECSY_REMOTE_DEVTOOLS_INJECTED=!0,window.__ECSY_REMOTE_DEVTOOLS={};let Version="",worldsBeforeLoading=[],onWorldCreated=e=>{var t=e.detail.world;Version=e.detail.version,worldsBeforeLoading.push(t)};window.addEventListener("ecsy-world-created",onWorldCreated);let onLoaded=()=>{var peer=new Peer(remoteId);peer.on("open",()=>{peer.on("connection",connection=>{window.__ECSY_REMOTE_DEVTOOLS.connection=connection,connection.on("open",(function(){infoDiv.innerHTML="Connected",connection.on("data",(function(data){if("init"===data.type){var script=document.createElement("script");script.setAttribute("type","text/javascript"),script.onload=()=>{script.parentNode.removeChild(script),window.removeEventListener("ecsy-world-created",onWorldCreated),worldsBeforeLoading.forEach(e=>{var t=new CustomEvent("ecsy-world-created",{detail:{world:e,version:Version}});window.dispatchEvent(t)})},script.innerHTML=data.script,(document.head||document.documentElement).appendChild(script),script.onload(),hookConsoleAndErrors(connection)}else if("executeScript"===data.type){let value=eval(data.script);data.returnEval&&connection.send({method:"evalReturn",value:value})}}))}))})})};injectScript("https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js",onLoaded)}if(hasWindow){const e=new URLSearchParams(window.location.search);e.has("enable-remote-devtools")&&enableRemoteDevtools()}const ActionType={DEFAULT:-1,PRIMARY:0,SECONDARY:1,FORWARD:2,BACKWARD:3,UP:4,DOWN:5,LEFT:6,RIGHT:7,INTERACT:8,CROUCH:9,JUMP:10,WALK:11,RUN:12,SPRINT:13};var AxisType;!function(e){e[e.SCREENXY=0]="SCREENXY",e[e.DPADONE=1]="DPADONE",e[e.DPADTWO=2]="DPADTWO",e[e.DPADTHREE=3]="DPADTHREE",e[e.DPADFOUR=4]="DPADFOUR"}(AxisType||(AxisType={}));var AxisType$1=AxisType;const MouseInputActionMap={0:ActionType.PRIMARY,2:ActionType.SECONDARY,1:ActionType.INTERACT},MouseInputAxisMap={mousePosition:AxisType$1.SCREENXY};class MouseInput extends Component{constructor(){super(...arguments),this.actionMap=MouseInputActionMap,this.axisMap=MouseInputAxisMap}}var LifecycleValue;MouseInput.schema={actionMap:{type:Types.Ref,default:MouseInputActionMap},axisMap:{type:Types.Ref,default:MouseInputAxisMap},downHandler:{type:Types.Ref},moveHandler:{type:Types.Ref},upHandler:{type:Types.Ref}},function(e){e[e.STARTED=0]="STARTED",e[e.ENDED=1]="ENDED",e[e.STARTING=2]="STARTING",e[e.CONTINUED=3]="CONTINUED",e[e.ENDING=4]="ENDING"}(LifecycleValue||(LifecycleValue={}));var LifecycleValue$1=LifecycleValue;class RingBuffer{constructor(e){if(this.buffer=[],this.pos=0,e<0)throw new RangeError("The size does not allow negative values.");this.size=e}static fromArray(e,t=0){const n=new RingBuffer(t);return n.fromArray(e,0===t),n}copy(){const e=new RingBuffer(this.getBufferLength());return e.buffer=this.buffer,e}clone(){const e=new RingBuffer(this.getBufferLength());return e.buffer=this.buffer,e}getSize(){return this.size}getPos(){return this.pos}getBufferLength(){return this.buffer.length}add(...e){e.forEach(e=>{this.buffer[this.pos]=e,this.pos=(this.pos+1)%this.size})}get(e){if(e<0&&(e+=this.buffer.length),!(e<0||e>this.buffer.length))return this.buffer.length<this.size?this.buffer[e]:this.buffer[(this.pos+e)%this.size]}getFirst(){return this.get(0)}getLast(){return this.get(-1)}remove(e,t=1){if(e<0&&(e+=this.buffer.length),e<0||e>this.buffer.length)return[];const n=this.toArray(),o=n.splice(e,t);return this.fromArray(n),o}pop(){return this.remove(0)[0]}popLast(){return this.remove(-1)[0]}toArray(){return this.buffer.slice(this.pos).concat(this.buffer.slice(0,this.pos))}fromArray(e,t=!1){if(!Array.isArray(e))throw new TypeError("Input value is not an array.");t&&this.resize(e.length),0!==this.size&&(this.buffer=e.slice(-this.size),this.pos=this.buffer.length%this.size)}clear(){this.buffer=[],this.pos=0}resize(e){if(e<0)throw new RangeError("The size does not allow negative values.");if(0===e)this.clear();else if(e!==this.size){const t=this.toArray();this.fromArray(t.slice(-e)),this.pos=this.buffer.length%e}this.size=e}full(){return this.buffer.length===this.size}empty(){return 0===this.buffer.length}}class InputActionHandler extends Component{constructor(){super(...arguments),this.queue=new RingBuffer(10),this.schema={queue:{type:ActionBufferType}}}}const ActionBufferType=createType({name:"ActionBuffer",default:new RingBuffer(10),copy:copyCopyable,clone:cloneClonable});class UserInput extends TagComponent{}class InputAxisHandler extends Component{constructor(){super(...arguments),this.queue=new RingBuffer(10),this.schema={queue:{type:AxisBufferType}}}}const AxisBufferType=createType({name:"ActionBuffer",default:new RingBuffer(10),copy:copyCopyable,clone:cloneClonable}),keys={37:1,38:1,39:1,40:1};function preventDefault(e){e.preventDefault()}function preventDefaultForScrollKeys(e){if(keys[e.keyCode])return preventDefault(e),!1}let supportsPassive=!1;try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){supportsPassive=!0}}))}catch(e){}const wheelOpt=!!supportsPassive&&{passive:!1},wheelEvent="onwheel"in document.createElement("div")?"wheel":"mousewheel";function disableScroll(){window.addEventListener("DOMMouseScroll",preventDefault,!1),window.addEventListener(wheelEvent,preventDefault,wheelOpt),window.addEventListener("touchmove",preventDefault,wheelOpt),window.addEventListener("keydown",preventDefaultForScrollKeys,!1)}function enableScroll(){window.removeEventListener("DOMMouseScroll",preventDefault,!1),window.removeEventListener(wheelEvent,preventDefault),window.removeEventListener("touchmove",preventDefault),window.removeEventListener("keydown",preventDefaultForScrollKeys,!1)}class MouseInputSystem extends System{constructor(){super(...arguments),this.moveHandler=(e,t)=>{t.getComponent(InputAxisHandler).queue.add({axis:this._mouse.axisMap.mousePosition,value:{x:e.clientX,y:e.clientY}})},this.buttonHandler=(e,t,n)=>{this._mouse=t.getComponent(MouseInput),this._mouse&&void 0!==this._mouse.actionMap[e.button]&&t.getMutableComponent(InputActionHandler).queue.add({action:this._mouse.actionMap[e.button],value:n})}}execute(){this.queries.axis.added.forEach(e=>{this._mouse=e.getMutableComponent(MouseInput),document.addEventListener("mousemove",t=>this._mouse.moveHandler=this.moveHandler(t,e),!1)}),this.queries.buttons.added.forEach(e=>{this._mouse=e.getMutableComponent(MouseInput),document.addEventListener("contextmenu",e=>e.preventDefault()),disableScroll(),document.addEventListener("mousedown",t=>this._mouse.downHandler=this.buttonHandler(t,e,LifecycleValue$1.STARTED),!1),document.addEventListener("mouseup",t=>this._mouse.upHandler=this.buttonHandler(t,e,LifecycleValue$1.ENDED),!1)}),this.queries.axis.removed.forEach(e=>{const t=e.getComponent(MouseInput);t&&document.removeEventListener("mousemove",t.upHandler)}),this.queries.buttons.removed.forEach(e=>{document.removeEventListener("contextmenu",e=>e.preventDefault()),enableScroll();const t=e.getComponent(MouseInput);t&&document.removeEventListener("mousedown",t.downHandler),t&&document.removeEventListener("mouseup",t.moveHandler)})}}MouseInputSystem.queries={buttons:{components:[MouseInput,InputActionHandler,UserInput],listen:{added:!0,removed:!0}},axis:{components:[MouseInput,InputAxisHandler,UserInput],listen:{added:!0,removed:!0}}};const KeyboardInputMap={w:ActionType.FORWARD,a:ActionType.LEFT,s:ActionType.RIGHT,d:ActionType.BACKWARD};class KeyboardInput extends Component{constructor(){super(...arguments),this.inputMap=KeyboardInputMap}}KeyboardInput.schema={inputMap:{type:Types.Ref,default:KeyboardInputMap}};class KeyboardInputSystem extends System{execute(){this.queries.keyboard.added.forEach(e=>{document.addEventListener("keydown",t=>{this.mapKeyToAction(e,t.key,LifecycleValue$1.STARTED)}),document.addEventListener("keyup",t=>{this.mapKeyToAction(e,t.key,LifecycleValue$1.ENDED)})}),this.queries.keyboard.removed.forEach(e=>{document.removeEventListener("keydown",t=>{this.mapKeyToAction(e,t.key,LifecycleValue$1.STARTED)}),document.removeEventListener("keyup",t=>{this.mapKeyToAction(e,t.key,LifecycleValue$1.ENDED)})})}mapKeyToAction(e,t,n){this._kb=e.getComponent(KeyboardInput),void 0!==this._kb.inputMap[t]&&e.getMutableComponent(InputActionHandler).queue.add({action:this._kb.inputMap[t],value:n})}}KeyboardInputSystem.queries={keyboard:{components:[KeyboardInput,InputActionHandler,UserInput],listen:{added:!0,removed:!0}}};class GamepadInput extends Component{}GamepadInput.schema={threshold:{type:Types.Number,default:.1},connected:{type:Types.Boolean,default:!1},dpadOne:{type:Types.Number},dpadTwo:{type:Types.Number},buttonA:{type:Types.Boolean},buttonB:{type:Types.Boolean},buttonX:{type:Types.Boolean},buttonY:{type:Types.Boolean}};class GamepadInputSystem extends System{execute(){this.queries.gamepad.added.forEach(e=>{const t=e.getMutableComponent(GamepadInput);window.addEventListener("gamepadconnected",e=>{console.log("A gamepad connected:",e.gamepad),t.connected=!0}),window.addEventListener("gamepaddisconnected",e=>{console.log("A gamepad disconnected:",e.gamepad),t.connected=!1})}),this.queries.gamepad.results.forEach(e=>{if(e.getMutableComponent(GamepadInput).connected){const e=navigator.getGamepads();for(let t=0;t<e.length;t++);}})}}GamepadInputSystem.queries={gamepad:{components:[GamepadInput],listen:{added:!0,removed:!0}}};const isBrowser="undefined"!=typeof window&&void 0!==window.document;class InputReceiver extends TagComponent{}class InputDebugSystem extends System{execute(){this.queries.actionReceivers.changed.forEach(e=>{console.log("Action: "),console.log(e.getComponent(InputActionHandler).queue.toArray[0])}),this.queries.axisReceivers.changed.forEach(e=>{console.log("Axis: "),console.log(e.getComponent(InputAxisHandler).queue.toArray[0])})}}InputDebugSystem.queries={actionReceivers:{components:[UserInput,InputActionHandler],listen:{changed:!0}},axisReceivers:{components:[InputReceiver,InputAxisHandler],listen:{changed:!0}}};const ActionMap={[ActionType.FORWARD]:{opposes:[ActionType.BACKWARD]},[ActionType.BACKWARD]:{opposes:[ActionType.FORWARD]},[ActionType.LEFT]:{opposes:[ActionType.RIGHT]},[ActionType.RIGHT]:{opposes:[ActionType.LEFT]}};class InputActionMapData extends Component{constructor(){super(...arguments),this.actionMap=ActionMap}}InputActionMapData.schema={data:{type:Types.Ref,default:ActionMap}};class InputActionSystem extends System{constructor(){super(...arguments),this._actionMap=ActionMap}execute(){this.queries.actionMapData.added.forEach(e=>{this._actionMap=e.getComponent(InputActionMapData).actionMap}),this.queries.userInputActionQueue.changed.forEach(e=>{this._userInputActionQueue=e.getMutableComponent(InputActionHandler),this.queries.actionReceivers.results.forEach(e=>{e.getComponent(InputActionHandler).queue.clear(),this.applyInputToListener(this._userInputActionQueue,e.getMutableComponent(InputActionHandler))})}),this._userInputActionQueue&&this._userInputActionQueue.queue.clear()}validateActions(e){if(!this._actionMap)return;const t=e.queue.toArray();for(let n=0;n<t.length;n++)for(let o=0;o<t.length;o++)n!=o&&(this.actionsOpposeEachOther(t,n,o)?(e.queue.remove(n),e.queue.remove(o)):this.actionIsBlockedByAnother(t,n,o)?e.queue.remove(n):this.actionOverridesAnother(t,n,o)&&e.queue.remove(o))}actionsOpposeEachOther(e,t,n){const o=e[t],s=e[n];return this._actionMap[o.action].opposes.forEach(e=>{if(e===s.action&&o.value===s.value)return!0}),!1}actionIsBlockedByAnother(e,t,n){const o=e[t],s=e[n];return this._actionMap[o.action].blockedBy.forEach(e=>{if(e===s.action&&o.value===s.value)return!0}),!1}actionOverridesAnother(e,t,n){const o=e[t],s=e[n];return this._actionMap[o.action].overrides.forEach(e=>{if(e===s.action&&o.value===s.value)return!0}),!1}applyInputToListener(e,t){e.queue.toArray().forEach(e=>{this._skip=!1,t.queue.toArray().forEach((n,o)=>{e.action===n.action&&e.value===n.value?this._skip=!0:e.action===n.action&&e.value!==n.value&&void 0!==e.value&&(t.queue.remove(o),t.queue.add(e),this._skip=!0)}),this._skip||t.queue.add(e)}),this.validateActions(t)}}InputActionSystem.queries={userInputActionQueue:{components:[UserInput,InputActionHandler],listen:{added:!0,changed:!0}},actionReceivers:{components:[InputReceiver,InputActionHandler]},actionMapData:{components:[InputActionMapData,UserInput],listen:{added:!0}}};class InputAxisSystem extends System{execute(){var e;null===(e=this.queries.userInputAxisQueue.added)||void 0===e||e.forEach(e=>{this._userInputAxisQueue=e.getMutableComponent(InputAxisHandler)}),!this._userInputAxisQueue||this._userInputAxisQueue.queue.getSize()<1||(this.queries.axisReceivers.results.forEach(e=>{e.getComponent(InputAxisHandler).queue.clear(),this.applyInputToListener(this._userInputAxisQueue,e.getMutableComponent(InputAxisHandler))}),this._userInputAxisQueue.queue.clear())}applyInputToListener(e,t){e.queue.toArray().forEach(e=>{let n=!1;t.queue.toArray().forEach((o,s)=>{e.axis===o.axis&&e.value===o.value?n=!0:e.axis===o.axis&&e.value!==o.value&&(t.queue.get(s).value=e.value,n=!0)}),n||t.queue.add(e)})}}InputAxisSystem.queries={userInputAxisQueue:{components:[UserInput,InputAxisHandler]},axisReceivers:{components:[InputReceiver,InputAxisHandler]}};const DEFAULT_OPTIONS={mouse:!0,keyboard:!0,touchscreen:!0,gamepad:!0,debug:!1};function initializeInputSystems(e,t=DEFAULT_OPTIONS,n,o,s){if(t.debug&&console.log("Initializing input systems..."),!isBrowser)return console.error("Couldn't initialize input, are you in a browser?");t.debug&&(console.log("Registering input systems with the following options:"),console.log(t)),e.registerSystem(InputActionSystem).registerSystem(InputAxisSystem),e.registerComponent(UserInput).registerComponent(InputActionHandler).registerComponent(InputAxisHandler).registerComponent(InputReceiver).registerComponent(InputActionMapData).registerComponent(UserInput),t.keyboard&&e.registerSystem(KeyboardInputSystem).registerComponent(KeyboardInput),t.mouse&&e.registerSystem(MouseInputSystem).registerComponent(MouseInput),t.gamepad&&e.registerSystem(GamepadInputSystem).registerComponent(GamepadInput);const i=e.createEntity().addComponent(UserInput).addComponent(InputActionHandler).addComponent(InputAxisHandler).addComponent(InputActionMapData).addComponent(InputReceiver),r=e.createEntity().addComponent(InputReceiver).addComponent(InputActionHandler).addComponent(InputActionMapData).addComponent(InputAxisHandler);s&&(r.getMutableComponent(InputActionMapData).actionMap=s),t.keyboard&&(i.addComponent(KeyboardInput),n&&(i.getMutableComponent(KeyboardInput).inputMap=n),console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity")),t.mouse&&(i.addComponent(MouseInput),o&&(i.getMutableComponent(MouseInput).actionMap=o),t.debug&&console.log("Registered MouseInputSystem and added MouseInput component to input entity")),t.gamepad&&(i.addComponent(GamepadInput),t.debug&&console.log("Registered GamepadInputSystem and added MouseInput component to input entity")),t.touchscreen&&t.debug&&console.log("Touchscreen is not yet implemented"),t.debug&&(e.registerSystem(InputDebugSystem).registerSystem(InputDebugSystem),console.log("INPUT: Registered input systems."))}export{initializeInputSystems};
