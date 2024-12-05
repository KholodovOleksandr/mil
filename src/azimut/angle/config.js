window.config = {
    version: 'v0.1',
    type: 'angle',
    html: 'angle.html',
    propsAmender: function (props) {
        props.alphaAPP = elementWrapper('alphaAPP', inputType.numeric);
    }
}
