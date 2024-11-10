import { print, clearScreen, printCentered } from "../utils/io.mjs";
import { ANSI } from "../utils/ansi.mjs";

const UI = [
"######                                    #####                         ",
"#     #   ##   ##### ##### #      ###### #     # #    # # #####   ####  ",
"#     #  #  #    #     #   #      #      #       #    # # #    # #      ",
"######  #    #   #     #   #      #####   #####  ###### # #    #  ####  ",
"#     # ######   #     #   #      #            # #    # # #####       # ",
"#     # #    #   #     #   #      #      #     # #    # # #      #    # ",
"######  #    #   #     #   ###### ######  #####  #    # # #       ####  ",                                                                        
];

let isDrawn = false; 
let countdown = 2500;
let lineIndex = 0;

const SplashScreen = {

    next: null,
    transitionTo: null,

    update: function (dt) {
        countdown -= dt;
        if (countdown <= 0) {
            this.transitionTo = this.next;
        }
    },

    draw: function (dt) {
        if (isDrawn) return;
        clearScreen();
        const interval = 100;

        UI.forEach((line, index) => {
            setTimeout(() => printCentered(line + "\n"), interval * index);
        });

        setTimeout(() => {
            isDrawn = false;
            print("\nPress enter to start.");
        }, interval * UI.length);
    },
};

export default SplashScreen;