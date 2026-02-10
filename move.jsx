var panelGlobal = this;
var dialog = (function () {
  // DIALOG
  // ======
  var dialog = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette"); 
      dialog.orientation = "column"; 
      dialog.alignChildren = ["center","top"]; 
      dialog.spacing = 10; 
      dialog.margins = 16; 

  var button1 = dialog.add("button", undefined, undefined, {name: "button1"}); 
      button1.text = "图层对齐"; 
      button1.alignment = ["center","top"];
      button1.onClick = layersAlign;

  var button2 = dialog.add("button", undefined, undefined, {name: "button2"}); 
      button2.text = "图层移动"; 
      button2.alignment = ["center","top"];
      button2.onClick = movecomp;

  var button3 = dialog.add("button", undefined, undefined, {name: "button3"}); 
      button3.text = "图层排列-顺序"; 
      button3.alignment = ["center","top"];
      button3.onClick = compIO1;

  var button4 = dialog.add("button", undefined, undefined, {name: "button4"}); 
      button4.text = "图层排列-倒序"; 
      button4.alignment = ["center","top"];
      button4.onClick = compIO2;

  dialog.layout.layout(true);
  dialog.layout.resize();
  dialog.onResizing = dialog.onResize = function () { this.layout.resize(); }

  if ( dialog instanceof Window ) dialog.show();

  return dialog;

}());

function compIO1() {  // 图层排列-顺序（正序）
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    testComp(comp, layers);

    var timeNow = comp.time;
    
    app.beginUndoGroup('图层排列-顺序');
    
    // 将第一个选中图层的 startTime 对齐到当前时间指示器
    layers[0].startTime = timeNow;
    
    // 后续图层依次接到前一图层的尾部
    for (var i = 1; i < layers.length; i++) {
        var prevDuration = layers[i-1].outPoint - layers[i-1].inPoint;
        layers[i].startTime = layers[i-1].startTime + prevDuration;
    }
    
    app.endUndoGroup();
}

function compIO2() {  // 图层排列-倒序
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    testComp(comp, layers);

    var timeNow = comp.time;
    
    app.beginUndoGroup('图层排列-倒序');
    
    // 反转选中顺序，使原先最后选中的图层最早出现
    var revLayers = layers.slice().reverse();
    
    revLayers[0].startTime = timeNow;
    
    for (var i = 1; i < revLayers.length; i++) {
        var prevDuration = revLayers[i-1].outPoint - revLayers[i-1].inPoint;
        revLayers[i].startTime = revLayers[i-1].startTime + prevDuration;
    }
    
    app.endUndoGroup();
}

function layersAlign() 
{
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    testComp(comp, layers);

    var timeNow = comp.time;
    app.beginUndoGroup('图层对齐');
    
    for (var i = 0, len = layers.length; i < len; i++)
    {
        var cur = layers[i];
        var offset = cur.inPoint - cur.startTime;  // 原偏移量
        cur.startTime = timeNow - offset;         // 使 inPoint 对齐到 timeNow
    }
    app.endUndoGroup();
}

function movecomp()
{
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    testComp(comp, layers);

    var timeNow = comp.time;
    app.beginUndoGroup('图层移动');
    
    var layersStartSort = [];
    for (var i = 0, len = layers.length; i < len; i++)
    {
        var cur = layers[i];
        var inPoint = cur.inPoint;
        layersStartSort.push(inPoint);
    }
    layersStartSort.sort(function(a, b) { return a - b; });
    
    var minInPoint = layersStartSort[0];
    
    for (var i = 0, len = layers.length; i < len; i++)
    {
        var cur = layers[i];
        var offset = cur.inPoint - minInPoint;
        cur.startTime = timeNow + (cur.startTime - cur.inPoint) + offset;
    }
    app.endUndoGroup();
}

function testComp(comp, layers){
    if (!(comp && comp instanceof CompItem)){
        alert("无效合成");
        return false;
    }
    else if (!layers || layers.length === 0){
        alert("无效图层");
        return false;
    }
    return true;
}