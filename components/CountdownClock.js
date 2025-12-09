import { useState, useEffect } from 'react'

const CountdownClock = props => {        
    const pxDiameter = props.pxDiameter || 100,
        pxRadius = Math.floor(pxDiameter/2),
        strokeWidth = props.strokeWidth || 6,
        fontSize = props.fontSize || 16,
        initSecs = props.initSecs || 0,
        fullSecs = props.fullSecs || 0,
        perimeter = Math.floor(Math.PI*pxDiameter)
    
    const [isPosted, setIsPosted] = useState(false),
        [timeParams, setTimeParams] = useState({
        timeLeftSecs: initSecs,
        timeLeftString: formatTime(initSecs),
        pathParams: {}
    })

    const countDown = (timeLeftSecs) => {
        setTimeParams({
            ...timeParams, 
            timeLeftString: formatTime(timeLeftSecs),
            timeLeftSecs: timeLeftSecs,
            pathParams: getPathParams(timeLeftSecs, fullSecs)
        })
    }

    // Runs on component mount, and on state update
    useEffect(() => { 
        let timer = null
        if (timeParams.timeLeftSecs > 0) {
            timer = setTimeout(countDown, 1000, timeParams.timeLeftSecs-1)
        }
        else if (props.timeoutFunction && !isPosted) {
            props.timeoutFunction()
            setIsPosted(true)
        }

        return () => clearTimeout(timer)
    })

    return (
        <div className="d-inline-block">
            <div className="base-timer">
                <svg 
                    className="base-timer__svg" 
                    viewBox={`0 0 ${pxDiameter+10} ${pxDiameter+10}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g className="base-timer__circle">
                    <circle 
                        className="base-timer__path-elapsed" 
                        cx={pxRadius+5} cy={pxRadius+5}
                        r={pxRadius}
                    >
                    </circle>
                    <path
                        id="base-timer-path-remaining"
                        strokeDasharray={`${Math.floor(timeParams.pathParams.fractionLeft*perimeter)} ${perimeter}`}
                        className={`base-timer__path-remaining ${timeParams.pathParams.pathColor}`}
                        d={`M ${pxRadius+5}, ${pxRadius+5} m -${pxRadius}, 0 a ${pxRadius},${pxRadius} 0 1,0 ${pxDiameter},0 a ${pxRadius},${pxRadius} 0 1,0 -${pxDiameter},0`}
                    ></path>
                    </g>
                </svg>
                <span id="base-timer-label" className="base-timer__label">
                    { timeParams.timeLeftString }
                </span>
            </div>
            <style>{`
                .base-timer {
                position: relative;
                width: ${pxDiameter}px;
                height: ${pxDiameter}px;
                }

                .base-timer__svg {
                transform: scaleX(-1);
                }

                .base-timer__circle {
                fill: none;
                stroke: none;
                }

                .base-timer__path-elapsed {
                stroke-width: ${strokeWidth}px;
                stroke: #bababa;
                }

                .base-timer__path-remaining {
                stroke-width: ${strokeWidth}px;
                stroke-linecap: round;
                transform: rotate(90deg);
                transform-origin: center;
                transition: 1s linear all;
                fill-rule: nonzero;
                stroke: currentColor;
                }

                .base-timer__path-remaining.green {
                color: rgb(65, 184, 131);
                }

                .base-timer__path-remaining.orange {
                color: orange;
                }

                .base-timer__path-remaining.red {
                color: red;
                }

                .base-timer__label {
                position: absolute;
                width: ${pxDiameter}px;
                height: ${pxDiameter}px;
                top: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${fontSize}px;
                color: #000;
                }
            `}</style>
        </div>
    );
};

function formatTime(secs) {
    const minsLeft = Math.floor(secs / 60);
    let secsLeft = secs % 60;
    if (secsLeft < 10) secsLeft = `0${secsLeft}`;

    return `${minsLeft}:${secsLeft}`;
}

function getPathParams(secsLeft, fullSecs) {
    let fractionLeft = secsLeft/fullSecs
    fractionLeft = fractionLeft - (1 / fullSecs) * (1 - fractionLeft)

    let pathColor = "green"

    if (fractionLeft < 0.2)  pathColor = "red"
    else if (fractionLeft <= 0.5) pathColor = "orange"

    return { fractionLeft, pathColor }
}

export default CountdownClock;