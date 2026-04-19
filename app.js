const ARM_FRONT = 1.94;
const ARM_BAG = 2.26;
const ARM_FUEL = 2.139;

let updating = false;

function sync(l, kg) {

    l.addEventListener("input", () => {
        if (updating) return;
        let d = parseFloat(density.value) || 0.72;
        let val = parseFloat(l.value);
        if (isNaN(val)) return;

        updating = true;
        kg.value = (val * d).toFixed(1);
        updating = false;

        calc();
    });

    kg.addEventListener("input", () => {
        if (updating) return;
        let d = parseFloat(density.value) || 0.72;
        let val = parseFloat(kg.value);
        if (isNaN(val)) return;

        updating = true;
        l.value = (val / d).toFixed(1);
        updating = false;

        calc();
    });
}

sync(fuel_l, fuel_kg);
sync(taxi_l, taxi_kg);
sync(trip_l, trip_kg);

function calc() {

    let bm = +bem.value || 0;
    let bmo = +bemo.value || 0;

    let pilot_v = +pilot.value || 0;
    let pax_v = +pax.value || 0;
    let bag_v = +bag.value || 0;

    let fuel = +fuel_kg.value || 0;
    let taxi = +taxi_kg.value || 0;
    let trip = +trip_kg.value || 0;

    let front = pilot_v + pax_v;
    let front_mo = front * ARM_FRONT;
    let bag_mo = bag_v * ARM_BAG;

    let zfm_m = bm + front + bag_v;
    let zfm_mo = bmo + front_mo + bag_mo;

    let fuel2 = fuel - taxi;

    let tom_m = zfm_m + fuel2;
    let tom_mo = zfm_mo + fuel2 * ARM_FUEL;

    let lm_m = tom_m - trip;
    let lm_mo = tom_mo - trip * ARM_FUEL;

	let fuel_mo = fuel * ARM_FUEL;
	let taxi_mo = -taxi * ARM_FUEL;
	let trip_mo = -trip * ARM_FUEL;

	output.textContent = `
	ITEM     MASS   MOMENT
	-----------------------
	BEM      ${bm.toFixed(0)}   ${bmo.toFixed(0)}
	FRONT    ${front.toFixed(0)}   ${front_mo.toFixed(0)}
	BAG      ${bag_v.toFixed(0)}   ${bag_mo.toFixed(0)}

	ZFM      ${zfm_m.toFixed(0)}   ${zfm_mo.toFixed(0)}
	FUEL     ${fuel.toFixed(0)}   ${fuel_mo.toFixed(0)}
	TAXI     ${(-taxi).toFixed(0)}   ${taxi_mo.toFixed(0)}

	TOM      ${tom_m.toFixed(0)}   ${tom_mo.toFixed(0)}
	TRIP     ${(-trip).toFixed(0)}   ${trip_mo.toFixed(0)}

	LM       ${lm_m.toFixed(0)}   ${lm_mo.toFixed(0)}
	`;

    draw(zfm_m, zfm_mo, tom_m, tom_mo, lm_m, lm_mo);
}

function clearAll() {
    document.querySelectorAll("input").forEach(i => {
        if (i.id !== "density") i.value = "";
    });
    output.textContent = "";
}

function draw(zm, zmo, tm, tmo, lm, lmo) {

    let c = graph;
    let ctx = c.getContext("2d");

    c.width = c.clientWidth;
    c.height = 300;

    ctx.clearRect(0,0,c.width,c.height);

    let sx = x => (x-750)/600 * c.width;
    let sy = y => c.height - (y-450)/300 * c.height;

    let pts = [[770,450],[870,450],[1350,720],[1230,720]];

    ctx.strokeStyle = "#00ff88";
    ctx.beginPath();
    pts.forEach((p,i)=>{
        let x=sx(p[0]), y=sy(p[1]);
        if(i==0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.stroke();

    function dot(m, mo, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx(mo), sy(m), 5, 0, 6.28);
        ctx.fill();
    }

    dot(zm,zmo,"cyan");
    dot(tm,tmo,"lime");
    dot(lm,lmo,"orange");

    ctx.strokeStyle="red";
    ctx.beginPath();
    ctx.moveTo(sx(zmo), sy(zm));
    ctx.lineTo(sx(tmo), sy(tm));
    ctx.lineTo(sx(lmo), sy(lm));
    ctx.stroke();
}

document.querySelectorAll("input").forEach(i => i.addEventListener("input", calc));

calc();