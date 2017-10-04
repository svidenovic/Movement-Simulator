
// position refers to the center of a body
    var ss_Width = 1000; // sim.space width
    var sb_Width = 60;   // sim.body width
    var Max_sb_Width; //
    var ss_Center = parseInt(ss_Width/2);
    var ss_Max = ss_Center -(sb_Width/2);
    var ss_Min = -ss_Max;
    function setOffset(x){
        // x = [ss_Min, ss_Max]
        return (ss_Center +x) - (sb_Width/2);
    }
    
    var animDelay = 10;
    var Min_animDelay = 1;
    var Max_animDelay = 5000;
    var animStep = 1;
    var Min_animStep = 1;
    var Max_animStep = 0; // gets generated dynamically
    
    var t_first = -10*Math.PI;
    var t_final = 10*Math.PI;
    var t_step = 0.01;
    
    var funcScale = -1;  // -1 = fit to space
    var fval = "t";      // pow(t,2)*sin(t)
    var fValid = false;
    
    var simSpace;
    var simBody;
    
    var loadBar;
    function setLBW(fract){
        var loadBar_width = Math.round(ss_Width*fract);
        $(loadBar).css("width", loadBar_width);
    }
    var x_arr;

$(document).ready(function(){
    
    loadBar = document.getElementById("loadBar");
    simSpace = document.getElementById("mainSVGdiv");
    make_simBody();
    simSpace.appendChild(simBody);
    
    var funcIn = $("#funcIn");
    var fScaleIn = $("#fScaleIn");
    var sbPlay = $("#sbPlay");
    var tStartIn = $("#tStartIn");
    var tStepIn = $("#tStepIn");
    var tEndIn = $("#tEndIn");
    var animDelayIn = $("#animDelayIn");
    var animStepIn = $("#animStepIn");
    var bodywIn = $("#bodywIn");
    
    fval = "t";
    fValid = true;
    $(funcIn).val(fval);
    $(funcIn).change(function(){
        fval = $(this).val();
        try{
            var t = 0;
            with(Math) eval(fval);
            fValid = true;
            //$(sbPlay).prop("disabled", false);
        }catch(e){
            fValid = false;
            //$(sbPlay).prop("disabled", true);
            alert(e.message);
        }
    });
    
    var c_autoV = "auto";
    $(fScaleIn).val(c_autoV);
    $(fScaleIn).change(function(){
        funcScale = parseFloat($(this).val());
        if (isNaN(funcScale) || funcScale <= 0){
            $(this).val(c_autoV);
            funcScale = -1;
        }else $(this).val(funcScale);
    });
    
    var c_tf = 0;
    t_first = c_tf;
    $(tStartIn).val(t_first);
    $(tStartIn).change(function(){
        try{
            with(Math) t_first = eval($(this).val());
        }catch(e){
            t_first = c_tf;
            $(this).val(t_first);
        }
    });
    
    var c_ts = 0.01;
    t_step = c_ts;
    $(tStepIn).val(t_step);
    $(tStepIn).change(function(){
        try{
            with(Math) t_step = eval($(this).val());
        }catch(e){
            t_step = c_ts;
            $(this).val(t_step);
        }
    });
    
    var c_te = 10;
    t_final = c_te;
    $(tEndIn).val(t_final);
    $(tEndIn).change(function(){
        try{
            with(Math) t_final = eval($(this).val());
        }catch(e){
            t_final = c_te;
            $(this).val(t_final);
        }
    });
    
    var c_ad = 10;
    animDelay = c_ad;
    $(animDelayIn).val(animDelay);
    $(animDelayIn).change(function(){
        animDelay = parseInt($(this).val());
        if (isNaN(animDelay) || animDelay < Min_animDelay){
            animDelay = c_ad;
        }else{
            if (animDelay > Max_animDelay)
                animDelay = Max_animDelay;
        }
        $(this).val(animDelay);
    });
    
    var c_as = 1;
    animStep = c_as;
    $(animStepIn).val(animStep);
    $(animStepIn).change(function(){
        animStep = parseInt($(this).val());
        if (isNaN(animStep) || animStep < Min_animStep){
            animStep = c_as;
        }else{
            var tlen = Math.round(1+(t_final-t_first)/t_step);
            Max_animStep = tlen-1;
            if (animStep > Max_animStep)
                animStep = Max_animStep;
        }
        $(this).val(animStep);
    });
    
    
    var c_sbw = 60;
    sb_Width = c_sbw;
    $(bodywIn).val(sb_Width);
    $(bodywIn).change(function(){
        sb_Width = parseInt($(this).val());
        if (isNaN(sb_Width) || sb_Width <= 0){
            sb_Width = c_sbw;
        }else{
            Max_sb_Width = Math.round(0.9*ss_Width);
            if (sb_Width > Max_sb_Width)
                sb_Width = Max_sb_Width;
        }
        $(this).val(sb_Width);
        simBody.setAttribute("width", sb_Width);
        simBody.setAttribute("x", setOffset(0));
    });
    
    $(sbPlay).click(function(){
        if(fValid){
            x_arr = gen_x();
            doAnim(x_arr);
        }
    });
    
    $("#getAuto").click(function(){
        alert($("#fScaleIn").attr("inval"));
    });
    
});

function doAnim(x){
    if (simBody.getAttribute("moving") == "false"){
        var curr = 0;
        simBody.setAttribute("moving", true);
        var interv = window.setInterval(function(){
            $("#sbPause").click(function(){
                window.clearInterval(interv);
                simBody.setAttribute("moving", false);
            });
            $("#sbReset").click(function(){
                simBody.setAttribute("moving", false);
                simBody.setAttribute("x", setOffset(0));
                simBody.setAttribute("x_index", 0);
                setLBW(0);
                window.clearInterval(interv);
            });
            curr = parseInt(simBody.getAttribute("x_index"));
            if (curr < x.length){
                simBody.setAttribute("x", x[curr]);
                curr += animStep;
                simBody.setAttribute("x_index", curr);
                setLBW( (curr+1)/x.length );
            }else{
                window.clearInterval(interv);
                simBody.setAttribute("moving", false);
                simBody.setAttribute("x_index", 0);
                setLBW(0);
            }
        },animDelay);
    }
}

function gen_x(){
    function x_function(t){
        with(Math) return eval(fval);
    }
    var t=[], y=[], y_absArr=[];
    for (var i=t_first; i<=t_final; i+=t_step)
        t.push(i);
    for (var tmp=0, i=0; i<t.length; i++){
        tmp = x_function(t[i]);
        y.push(tmp);
        if (funcScale<=0) y_absArr.push(Math.abs(tmp));
    }
    if (funcScale<=0){
        var y_max = Math.max.apply(null, y_absArr);
        funcScale = 1/y_max;
        $("#fScaleIn").attr("inval", funcScale);
    }
    for (var i=0; i<y.length; i++)
        y[i] = setOffset( Math.round(ss_Max*funcScale*y[i]) );
    return y;
}

function make_simBody(){
    simBody = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    simBody.setAttribute("id", "simBody");
    simBody.setAttribute("x", setOffset(0));
    simBody.setAttribute("y", 0);
    simBody.setAttribute("width", sb_Width);
    simBody.setAttribute("height", 100);
    simBody.setAttribute("rx", 5);
    simBody.setAttribute("ry", 5);
    var x_index = document.createAttribute("x_index");
        x_index.value = 0;
    var moving = document.createAttribute("moving");
        moving.value = false;
    simBody.setAttributeNode(x_index);
    simBody.setAttributeNode(moving);
}
