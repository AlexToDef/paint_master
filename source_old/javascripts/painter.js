$(function(){

  window.painter = new window.PaintMe.Painter({
    applyOnImage: true,
    paintableElement: $('img'),
    tools: ['Pen', 'CircleShape', 'RectangleShape']
  });
  
})
