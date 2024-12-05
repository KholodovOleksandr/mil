// TOD: code bellow is a codesmell. It uses if-else pattern
document.getElementById('version').innerText = window.config.version;
document.getElementById('currentYear').value = new Date().getFullYear();
document.getElementById('calculate').addEventListener('click', handleCalculate);
document.getElementById('download').addEventListener('click', download);

checkNewVersion();

function elementWrapper(selector, type) {

    let element;
    let value;
    let state = null;
    let vFunc;

    if (type === inputType.numeric) {
        element = document.getElementById(selector);
        if (!element) {
            return { value: null }
        }
        element.onblur = () => chekElement(true);
        element.oninput = () => chekElement();
        value = () => +element.value;
        vFunc = validate;
    } else {
        element = document.querySelector(selector);
        if (!element) {
            return { value: null }
        }
        value = () => document.querySelector(selector).value;
        vFunc = () => { };
    }

    function chekElement(isBlur) {
        if (isBlur && state === 1 || state === 2) {
            validate();
        }
        else if (!isBlur && state !== 2) {
            state = 1;
        }
        document.getElementById('calculate').disabled = document.getElementsByClassName('invalid').length ? true : false;
    }

    function validate() {
        if (element.checkValidity()) {
            element.parentElement.classList.remove('invalid')
        }
        else {
            state = 2;
            element.parentElement.classList.add('invalid')
        }
    }

    return {
        value, validate: vFunc
    }
}

const props = {
    currentYear: elementWrapper('currentYear', inputType.numeric),
    year: elementWrapper('year', inputType.numeric),
    gradus: elementWrapper('gradus', inputType.numeric),
    minuta: elementWrapper('minuta', inputType.numeric),
    aplhaB: elementWrapper('aplhaB', inputType.numeric),
    yearlyGradus: elementWrapper('yearlyGradus', inputType.numeric),
    yearlyMinuta: elementWrapper('yearlyMinuta', inputType.numeric),
    direction: elementWrapper('input[name="direction"]:checked', inputType.rb),
    yearlyDirection: elementWrapper('input[name="yearlyDirection"]:checked', inputType.rb),
}

if (window.config.propsAmender && typeof (window.config.propsAmender) === 'function') {
    window.config.propsAmender(props);
}

function handleCalculate(e) {

    for (let prop in props) {
        props[prop].validate();
    }
    if (document.getElementsByClassName('invalid').length) {
        document.getElementById('calculate').disabled = true;
        return;
    }

    let alphaAM = props.aplhaB.value() > 3000 ? props.aplhaB.value() - 3000 : props.aplhaB.value() + 3000;

    // props.alphaAPP is used only for angle.html
    if (props.alphaAPP && props.alphaAPP.value()) {
        alphaAM -= props.alphaAPP.value();
    }

    let yearsPassed = props.currentYear.value() - props.year.value();
    let inclinationInMinutes = (props.direction.value() == 'west' ? -1 : 1) * (props.gradus.value() * 60 + props.minuta.value()) +
        (yearsPassed * (props.yearlyDirection.value() == 'west' ? -1 : 1) * (props.yearlyGradus.value() * 60 + props.yearlyMinuta.value()));

    let mistake = inclinationInMinutes / 3.6;
    mistake = Math.round(mistake);

    let alphaA = alphaAM + mistake;
    let calibrate = alphaA > 6000 ? -6000 : alphaA < 0 ? 6000 : 0;
    alphaA += calibrate;

    let alphaAInMinutes = alphaA * 3.6;

    if (window.config.type === 'antenna') {
        let alphaAInGraduses = alphaAInMinutes / 60;
        document.getElementById('alphaAInGraduses').innerText = alphaAInGraduses.toFixed(1);
    }

    if (window.config.type === 'angle') {
        let alphaAInGraduses = parseInt(alphaAInMinutes / 60);
        document.getElementById('alphaAInGraduses').innerText =
            `${alphaAInGraduses}° ${(alphaAInMinutes - alphaAInGraduses * 60).toFixed(0)}'`;
    }

    document.getElementById('alphaA').innerText = alphaA;

    document.getElementsByClassName('result-block')[0].classList.add('highlight');

    setTimeout(() => {
        document.getElementsByClassName('result-block')[0].classList.remove('highlight');
    }, 1600);
}

async function download(e) {
    document.getElementsByClassName('loading-state')[0].classList.remove('d-n');

    try {
        let resp = await fetch(baseUrl + window.config.html)
        let html = await resp.text()
        const a = document.createElement("a");

        a.download = window.config.html.replace('.html', '') + `-calc-${window.config.version}.html`;
        a.href = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html);
        document.body.appendChild(a);
        a.click();
    }
    catch {
        alert('Сталася помилка, спробуйте пізніше.')
    }
    document.getElementsByClassName('loading-state')[0].classList.add('d-n');
}

function checkNewVersion() {
    fetch('https://api.github.com/repos/KholodovOleksandr/mil/contents/versions.json')
        .then(resp => resp.json()
            .then(j => fetch(j.download_url)
                .then(r => r.json()
                    .then(handleVersionList))
            ))
}

function handleVersionList(r) {
    const currentV = window.config.version.replace('v', '').trim();
    let newVersions = [];
    let markNextAsNew = false;

    let versions = r[window.config.type];
    let sortedVersions = versions.map(a => a.v.split('.').map(n => +n + 100000).join('.')).sort()
        .map(a => a.split('.').map(n => +n - 100000).join('.'));

    for (let i = 0; i < sortedVersions.length; i++) {
        if (markNextAsNew) {
            newVersions.push({
                v: sortedVersions[i],
                description: versions.filter(s => s.v === sortedVersions[i])[0].description
            })
        }
        if (sortedVersions[i] === currentV) {
            markNextAsNew = true;
        }
    }

    if (newVersions.length) {
        document.getElementsByClassName('popover-title')[0].innerText += ` (поточна ${currentV})`;
        let ul = document.getElementsByClassName('popover-content')[0];
        newVersions.forEach(v => {
            let li = document.createElement('li');
            li.innerText = `v${v.v} - ${v.description}`;
            ul.appendChild(li);
        })
        document.getElementById('mypopover').showPopover();
    }
}
