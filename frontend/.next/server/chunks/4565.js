exports.id=4565,exports.ids=[4565],exports.modules={45542:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=45542,e.exports=t},64528:(e,t,i)=>{"use strict";function a(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}i.d(t,{A:()=>a}),(0,i(30421).eW)(a,"populateCommonDb")},2130:(e,t,i)=>{"use strict";i.d(t,{diagram:()=>W});var a=i(5675),l=i(64528),r=i(36414),s=i(84278),o=i(30421),n=i(53118),c=i(50779),d=s.vZ.pie,p={sections:new Map,showData:!1,config:d},u=p.sections,g=p.showData,h=structuredClone(d),f=(0,o.eW)(()=>structuredClone(h),"getConfig"),x=(0,o.eW)(()=>{u=new Map,g=p.showData,(0,s.ZH)()},"clear"),m=(0,o.eW)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,t),o.cM.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),w=(0,o.eW)(()=>u,"getSections"),$=(0,o.eW)(e=>{g=e},"setShowData"),T=(0,o.eW)(()=>g,"getShowData"),y={getConfig:f,clear:x,setDiagramTitle:s.g2,getDiagramTitle:s.Kr,setAccTitle:s.GN,getAccTitle:s.eu,setAccDescription:s.U$,getAccDescription:s.Mx,addSection:m,getSections:w,setShowData:$,getShowData:T},D=(0,o.eW)((e,t)=>{(0,l.A)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),S={parse:(0,o.eW)(async e=>{let t=await (0,n.Qc)("pie",e);o.cM.debug(t),D(t,y)},"parse")},v=(0,o.eW)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),C=(0,o.eW)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),i=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,c.ve8)().value(e=>e.value).sort(null)(i)},"createPieArcs"),W={parser:S,db:y,renderer:{draw:(0,o.eW)((e,t,i,l)=>{o.cM.debug("rendering pie chart\n"+e);let n=l.db,d=(0,s.nV)(),p=(0,r.Rb)(n.getConfig(),d.pie),u=(0,a.P)(t),g=u.append("g");g.attr("transform","translate(225,225)");let{themeVariables:h}=d,[f]=(0,r.VG)(h.pieOuterStrokeWidth);f??=2;let x=p.textPosition,m=(0,c.Nb1)().innerRadius(0).outerRadius(185),w=(0,c.Nb1)().innerRadius(185*x).outerRadius(185*x);g.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let $=n.getSections(),T=C($),y=[h.pie1,h.pie2,h.pie3,h.pie4,h.pie5,h.pie6,h.pie7,h.pie8,h.pie9,h.pie10,h.pie11,h.pie12],D=0;$.forEach(e=>{D+=e});let S=T.filter(e=>"0"!==(e.data.value/D*100).toFixed(0)),v=(0,c.PKp)(y).domain([...$.keys()]);g.selectAll("mySlices").data(S).enter().append("path").attr("d",m).attr("fill",e=>v(e.data.label)).attr("class","pieCircle"),g.selectAll("mySlices").data(S).enter().append("text").text(e=>(e.data.value/D*100).toFixed(0)+"%").attr("transform",e=>"translate("+w.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let W=g.append("text").text(n.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),b=[...$.entries()].map(([e,t])=>({label:e,value:t})),A=g.selectAll(".legend").data(b).enter().append("g").attr("class","legend").attr("transform",(e,t)=>"translate(216,"+(22*t-22*b.length/2)+")");A.append("rect").attr("width",18).attr("height",18).style("fill",e=>v(e.label)).style("stroke",e=>v(e.label)),A.append("text").attr("x",22).attr("y",14).text(e=>n.getShowData()?`${e.label} [${e.value}]`:e.label);let k=Math.max(...A.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),M=W.node()?.getBoundingClientRect().width??0,O=Math.min(0,225-M/2),R=Math.max(512+k,225+M/2)-O;u.attr("viewBox",`${O} 0 ${R} 450`),(0,s.v2)(u,450,R,p.useMaxWidth)},"draw")},styles:v}}};