loadScript("election_results.js");
// const Election_2016 = parseElectionData(electionData).votes;

let right_states = []
let left_states = []

const electoralVotes = {
    AL: 9,
    AK: 3,
    AZ: 11,
    AR: 6,
    CA: 55,
    CO: 9,
    CT: 7,
    DE: 3,
    DC: 3,
    FL: 29,
    GA: 16,
    HI: 4,
    ID: 4,
    IL: 20,
    IN: 11,
    IA: 6,
    KS: 6,
    KY: 8,
    LA: 8,
    ME: 4,
    MD: 10,
    MA: 11,
    MI: 16,
    MN: 10,
    MS: 6,
    MO: 10,
    MT: 3,
    NE: 5,
    NV: 6,
    NH: 4,
    NJ: 14,
    NM: 5,
    NY: 29,
    NC: 15,
    ND: 3,
    OH: 18,
    OK: 7,
    OR: 7,
    PA: 20,
    RI: 4,
    SC: 9,
    SD: 3,
    TN: 11,
    TX: 38,
    UT: 6,
    VT: 3,
    VA: 13,
    WA: 12,
    WV: 5,
    WI: 10,
    WY: 3
};

//1 is left 0 is right
const Election_2020 = {
    AL: 0, AK: 0, AZ: 1, AR: 0, CA: 1, CO: 1, CT: 1, DE: 1, DC: 1, FL: 1, GA: 1, HI: 1, ID: 0, IL: 1, IN: 0, IA: 1, KS: 0, KY: 0, LA: 0, ME: 1, MD: 1, MA: 1, MI: 1, MN: 1, MS: 0, MO: 0, MT: 0, NE: 0, NV: 1, NH: 1, NJ: 1, NM: 1, NY: 1, NC: 1, ND: 0, OH: 0, OK: 0, OR: 1, PA: 1, RI: 1, SC: 0, SD: 0, TN: 0, TX: 0, UT: 0, VT: 1, VA: 1, WA: 1, WV: 0, WI: 1, WY: 0
};

var left = "#4441ff";
var right = "#e22f2f";

var colors = {
    state_bg: "#8b8b8b",
    state_hover: "#afafaf",
    left: left,
    right: right,
    left_hover: lightenHexColor(left),
    right_hover: lightenHexColor(right),
};

const state_paths = document.getElementsByTagName("path");
var mySVG = document.getElementById('us_map');

 // Is set to true because it will toggle back.
let display_settings = true;
var settings_window = document.getElementById('settings');
var settings_wheel = document.getElementById('settings-wheel');

//Check Box for displaying settings
var checkbox = document.getElementById("instruction-toggle");
checkbox.checked = true;

var settings_wheel_svg = document.getElementById("settings-wheel-svg");

settings_wheel_svg.addEventListener('click', (event) => {
    toggle_settings();
});

// set_states(Election_2020);

checkbox.addEventListener("change", (event) => {
    if (checkbox.checked == false) {
        document.getElementById("info").style.display = "none";
    } else {
        if (window.innerWidth > 1148) {
            document.getElementById("info").style.display = "block";
        } else {
            checkbox.checked = false;
        }
    }
});

// I couldnt find a good way to resize the svg with css
addEventListener("resize", (event) => {
    window_resize();
});

document.getElementById("right_color").onchange = function() {
    colors.right = this.value;
    colors.right_hover = lightenHexColor(this.value);
    document.getElementById("right_bar").style.background = this.value;
    re_apply_color();
}

document.getElementById("left_color").onchange = function() {
    colors.left = this.value;
    colors.left_hover = lightenHexColor(this.value);
    document.getElementById("left_bar").style.background = this.value;
    re_apply_color();
}

function handle_states(){
    for (let i = 0; i < state_paths.length; i++) {
        
        // Set the initial state color
        state_paths[i].style = "stroke-width:0.97063118000000004; fill:" + colors.state_bg + "; transition:0.1s;"

        if(right_states.includes(state_paths[i].id)){
            state_paths[i].style.fill = colors.right;
        }

        if(left_states.includes(state_paths[i].id)){
            state_paths[i].style.fill = colors.left;
        }
    }
}

function color_states() {
    for (let i = 0; i < state_paths.length; i++) {
        
        // Set the initial state color

        state_paths[i].style = "stroke-width:0.97063118000000004; fill:" + colors.state_bg + "; transition:0.1s;";;
        

        //Adding right state
        state_paths[i].addEventListener('contextmenu', (event) => {

            if(state_paths[i].id =="settings-wheel") {
                event.preventDefault();
                // toggle_settings();
            } else {
                event.preventDefault();
                right_click(event, state_paths, i);
            }

            update_text_color()
        });

        //Adding left states
        state_paths[i].addEventListener('click', (event) => {

            if(state_paths[i].id == "settings-wheel") {
                console.log("Clicking settings")
                // toggle_settings();
                return;
            } else {
                console.log("Clicking States")
            }

            //Change the color of the state on click
            state_paths[i].style.fill = colors.left_hover;

            //We need to check to see if it is already in the right states list and remove it.
            if(right_states.includes(state_paths[i].id)) {
                remove_item_from_array(right_states, state_paths[i].id);
                if(calc_electoral_votes(right_states) != 0){
                    move_progress_bar((calc_electoral_votes(right_states)/270)*100, "right_bar");
                    document.getElementById("counter_right").innerHTML = calc_electoral_votes(right_states) + " / 270";
                } else {
                    move_progress_bar(0,"right_bar");
                    document.getElementById("counter_right").innerHTML = calc_electoral_votes(right_states) + " / 270";
                }
            }

            //Check to make sure its not already in there before we add it.
            if(!left_states.includes(state_paths[i].id)) {
                left_states.push(state_paths[i].id);
            }

            //Print a helpful message
            console.log("right states now: " + right_states.toString() + " ELECTORAL: " + calc_electoral_votes(right_states))
            console.log("left states now: " + left_states.toString()  + " ELECTORAL: " + calc_electoral_votes(left_states));

            //Finally, we need to update the left votes bar
            move_progress_bar((calc_electoral_votes(left_states)/270)*100, "left_bar");
            document.getElementById("counter_left").innerHTML = calc_electoral_votes(left_states) + " / 270";

            update_text_color()
        });

        // Add event listeners for hover
        state_paths[i].addEventListener("mouseover", function(e) {
            if(state_paths[i].id != "settings-wheel") {
                if(right_states.includes(state_paths[i].id)) {
                    state_paths[i].style.fill = colors.right_hover;
                } else if (left_states.includes(state_paths[i].id)) {
                    state_paths[i].style.fill = colors.left_hover;
                } else {
                    this.style.fill = colors.state_hover;
                }
            } else {
                if(!display_settings){
                    state_paths[i].style.fill = "#2a2a2a";
                } else {
                    state_paths[i].style.fill = colors.state_hover;
                }
            }
        });

        state_paths[i].addEventListener("mouseout", function() {
            if(state_paths[i].id !="settings-wheel") {
                if(right_states.includes(state_paths[i].id)) {
                    state_paths[i].style.fill = colors.right;
                } else if (left_states.includes(state_paths[i].id)) {
                    state_paths[i].style.fill = colors.left;
                } else {
                    this.style.fill = colors.state_bg;
                }
            } 
            
        });
    }
}

//Helper function for removing things from an array
function remove_item_from_array(arr, itemToRemove) {
    const index = arr.indexOf(itemToRemove);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

//I put this in its own function because of double click.
function right_click(event, state_paths, i) {
    //Update the color.
    state_paths[i].style.fill = colors.right_hover;

    //Check to see if this has been removed from left states list.
    if(left_states.includes(state_paths[i].id)) {
        remove_item_from_array(left_states, state_paths[i].id);
        if(calc_electoral_votes(left_states) != 0){
            move_progress_bar((calc_electoral_votes(left_states)/270)*100, "left_bar");
            document.getElementById("counter_left").innerHTML = calc_electoral_votes(left_states) + " / 270";
        } else {
            move_progress_bar(0,"left_bar");
            document.getElementById("counter_left").innerHTML = calc_electoral_votes(left_states) + " / 270";
        }
        
    }

    //Double check its not already in there before we add it.
    if(!right_states.includes(state_paths[i].id)) {
        right_states.push(state_paths[i].id);
    }

    //Probably an issue with the division of 0.
    console.log("right states now: " + right_states.toString() + " ELECTORAL: " + calc_electoral_votes(right_states))
    console.log("left states now: " + left_states.toString()  + " ELECTORAL: " + calc_electoral_votes(left_states));
    move_progress_bar((calc_electoral_votes(right_states)/270)*100, "right_bar");

    document.getElementById("counter_right").innerHTML = calc_electoral_votes(right_states) + " / 270";
}

function calc_electoral_votes(arr) {
    if (arr.length === 0) {
        return 0;
    }

    let total = 0;
    for (let i = 0; i < arr.length; i++) {
        if (electoralVotes.hasOwnProperty(arr[i])) {
            total += electoralVotes[arr[i]];
        } else {
            console.error(`Error: Electoral votes for "${arr[i]}" not found.`);
        }
    }

    return total;
}

function move_progress_bar(percentage, bar) {
      var elem = document.getElementById(bar);
      if(percentage != 0){
        elem.style.width = percentage + "%";
      } else {
        elem.style.width = 2 + "%";
      }
}

function lightenHexColor(hexCode, amount = 20) {
    // Remove the "#" symbol from the hex code
    hexCode = hexCode.replace("#", "");
  
    // Parse the hex code into separate red, green, and blue components
    const red = parseInt(hexCode.substr(0, 2), 16);
    const green = parseInt(hexCode.substr(2, 2), 16);
    const blue = parseInt(hexCode.substr(4, 2), 16);
  
    // lighter components
    const newRed = Math.min(255, red + amount);
    const newGreen = Math.min(255, green + amount);
    const newBlue = Math.min(255, blue + amount);
  
    // Convert the new components 
    const newHex = `#${(newRed).toString(16).padStart(2, "0")}${(newGreen).toString(16).padStart(2, "0")}${(newBlue).toString(16).padStart(2, "0")}`;
  
    return newHex;
}

function window_resize(){
    // Resizes the window.
    if(window.innerWidth > 1148){
        //If you arent displaying the info before, dont display it now
        if(document.getElementById("info").style.display == "none") {
            checkbox.checked = false;
        } else {
            checkbox.checked = true;
        }

        mySVG.setAttribute("height", "75%" );
        mySVG.setAttribute("width", "75%");
    } 
    if (window.innerWidth > 1600) {
        mySVG.setAttribute("height", "60%" );
        mySVG.setAttribute("width", "60%");
    } 
    
    if (window.innerWidth < 1148) {
        checkbox.checked = false;
        mySVG.setAttribute("height", "100%" ); 
        mySVG.setAttribute("width", "100%");
    }
    console.log("Resizing")
}

function re_apply_color(){
    for (let i = 0; i < state_paths.length; i++) {
        
        // Set the initial state color
        state_paths[i].style = "stroke-width:0.97063118000000004; fill:" + colors.state_bg + "; transition:0.1s;"

        if(right_states.includes(state_paths[i].id)){
            state_paths[i].style.fill = colors.right;
        }

        if(left_states.includes(state_paths[i].id)){
            state_paths[i].style.fill = colors.left;
        }
    }
}
function toggle_settings() {
    if (display_settings === false) {
        display_settings = true;
        settings_wheel.style.fill = colors.state_hover;
        settings_window.style.right = "-500px";
    } else if (display_settings === true) {
        display_settings = false;
        settings_wheel.style.fill = "#2a2a2a";
        settings_window.style.right = "0px";
    }
}


function update_text_color() {
    console.log("TESTING: " + calc_electoral_votes(right_states))
    if(calc_electoral_votes(right_states) > 35){
        document.getElementById("counter_right").style.animation = "fadeIn 2s";
        document.getElementById("counter_right").style.display = "block"
    } else {
        document.getElementById("counter_right").style.animation = "fadeIn 0.2s";
        document.getElementById("counter_right").style.display = "none"
    }

    if(calc_electoral_votes(left_states) > 35){
        document.getElementById("counter_left").style.animation = "fadeIn 2s";
        document.getElementById("counter_left").style.display = "block"
    } else {
        document.getElementById("counter_left").style.animation = "fadeIn 0.2s";
        document.getElementById("counter_left").style.display = "none"
    }
}

function set_states(election){
    right_states = [];
    left_states = [];

    for (const [state, value] of Object.entries(election)) {
        if(value == 0) {
            right_states.push(state);
        } else {
            left_states.push(state);
        }
    }

    move_progress_bar((calc_electoral_votes(left_states)/270)*100, "left_bar");
    move_progress_bar((calc_electoral_votes(right_states)/270)*100, "right_bar");

    document.getElementById("counter_left").innerHTML = calc_electoral_votes(left_states) + " / 270";
    document.getElementById("counter_right").innerHTML = calc_electoral_votes(right_states) + " / 270";

    handle_states();
    update_text_color();
    console.log("Updated Election Information!")
}

function empty_states(){
    right_states = [];
    left_states = [];

    move_progress_bar((calc_electoral_votes(left_states)/270)*100, "left_bar");
    move_progress_bar((calc_electoral_votes(right_states)/270)*100, "right_bar");

    document.getElementById("counter_left").innerHTML = calc_electoral_votes(left_states) + " / 270";
    document.getElementById("counter_right").innerHTML = calc_electoral_votes(right_states) + " / 270";

    handle_states();
    update_text_color();
}

function parseElectionData(jsonData) {
    const parsedData = jsonData;//JSON.parse(jsonData);
    const result = {
        votes: {}
    };

    for (const state in parsedData.votes) {
        const stateData = parsedData.votes[state];

        if(stateData.electoral.democrat > stateData.electoral.republican){
            result.votes[state] = 1;
        } else if (stateData.electoral.democrat < stateData.electoral.republican) {
            result.votes[state] = 0;
        } else {
            //Do nothing
        }
    }

    return result;
}

function loadScript(url)
{    
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}

function reset_colors() {
    colors = {
        state_bg: "#8b8b8b",
        state_hover: "#afafaf",
        left: left,
        right: right,
        left_hover: lightenHexColor(left),
        right_hover: lightenHexColor(right),
    };

    document.getElementById("left_color").value = left;
    document.getElementById("right_color").value = right;
    document.getElementById("left_bar").style.background = left;
    document.getElementById("right_bar").style.background = right;

    handle_states();
    update_text_color();
}

color_states();