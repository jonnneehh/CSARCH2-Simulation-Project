var input_mantissa = document.getElementById("mantissa-input").value;
var input_exponent = document.getElementById("exponent").value


function normalize(mantissa, exponent) {
    //get sign
    let sign = mantissa[0] === '-' ? -1 : 1; //if neg, -1, else, 1

    //remove -
    mantissa = mantissa.replace('-', ''); 

    //get position of decimal point
    let decimalPos = mantissa.indexOf('.');
    if (decimalPos === -1) {
        decimalPos = mantissa.length;
    }

    //get number of bits to shift point
    let shift = decimalPos - exponent;

    //if shift is neg, add zeroes to beginning of mantissa
    if (shift < 0) {
        mantissa = '0'.repeat(-shift) + mantissa;
        shift = 0;
    }

    //Shift point left or right
    mantissa = mantissa.replace('.', ''); //remove .
    if (shift > 0) {
        mantissa = mantissa.padEnd(shift + mantissa.length, '0');
    } else {
        mantissa = mantissa.padStart(shift + mantissa.length, '0');
    }
    mantissa = mantissa.slice(0, mantissa.length - 52) + '.' + mantissa.slice(mantissa.length - 52);

    return {mantissa: mantissa, exponent: exponent};
}

function converttoBinary64(mantissa, exponent) { 
    let signBit = mantissa[0] === '-' ? '1': '0';
    
    mantissa = mantissa.replace('-', '');
    let parts = mantissa.split('.');
    let intPart = parseInt(parts[0], 2).toString(2);
    let fracPart = parts.length > 1 ? parts[1]:'';
    let binaryMantissa = intPart + '.' + fracPart;

    //normalize mantissa
    let normalized = normalize(binaryMantissa, exponent);
    let normalizedMantissa = normalized.mantissa;
    let normalizedExponent = normalized.exponent;

    //get e'
    let biasedExponent = normalizedExponent + 1023;

    //Convert e' to binary and pad to 11 bits
    let eprime = biasedExponent.toString(2).padStart(11, '0');
    
    //pad normalized mantissa to 52 bits
    let binaryMantissaPadded = normalizedMantissa.replace('.', '').padEnd(52, '0');

    //combine 
    let binary = signBit + eprime + binaryMantissaPadded;

    return binary;
}



function returnOutput() {
    subprocess = '';
    output = '';
    
    subprocess = normalize(input_mantissa, input_exponent);
    output = binarytofloat64(subprocess[0], subprocess[1]);
    document.getElementById('output-binary-text').innerHTML = output;
}


