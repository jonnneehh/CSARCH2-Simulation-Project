var input_mantissa = document.getElementById("mantissa-input").value;
var input_exponent = document.getElementById("exponent").value


function roundToNearest(mantissa){
    let bits = mantissa.split('');
    let lastBit = bits[bits.length-1];

    bits = bits.slice(0, bits.length - 1);
    let roundUp = false;
    for (let i = bits.length - 1; i >= 0; i--) {
        if (bits[i] === '1') {
            if (!roundUp) {
                roundUp = true;
            }
        }
        else if (roundUp) {
            bits[i] = '1';
            roundUp = false;
        }
        if (i === bits.length - 53) {
            break;
        }
    }
    if (roundUp) {
        lastBit = '1';
    }
    bits.push(lastBit);
    return bits.join('');
}

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

    //round mantissa
    mantissa = roundToNearest(mantissa);

    //if mantissa rounded up, shift decimal point, add exponent
    if (mantissa === '1') {
        mantissa = '0.' + '0'.repeat(52);
        exponent++;
    }

    //adjust sign of exponent
    exponent *= sign;

    return {mantissa: mantissa, exponent: exponent};
}

function converttoBinary64(mantissa, exponent) { 
    let signBit = mantissa[0] === '-' ? '1': '0';
    
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

    //perform checks
    let status = '';
    if (eprime === '11111111111') {
        if (binaryMantissaPadded === '0000000000000000000000000000000000000000000000000000') {
            if (signBit === '0') {
                status = '+inf';
                return status;
            }
            else {
                status = '-inf';
                return status;
            }
        }
    }
    
    if (eprime === '00000000000') { //e' == 0
        if (binaryMantissaPadded === '0000000000000000000000000000000000000000000000000000') {
            if (signBit === '0') {
                status = '+0';
                return status;
            }
            else {
                status = '-0';
                return status;
            }
        }
        else { //e' == zero, but significand != 0
            status = 'Denormalized';
            return status;
        }
    }
    
    //combine 
    let binary = signBit + eprime + binaryMantissaPadded;

    return binary;
}


function converttoHex(bits){
    let hex = '';
    for (let i = 0; i < 16; i++) {
        let slice = bits.slice(i * 4, (i + 1) * 4);
        let nibble = parseInt(slice, 2).toString(16);
        hex += nibble;
    }

    return hex;
}


function returnOutput() {
    subprocess = '';
    output = '';
    
    subprocess = normalize(input_mantissa, input_exponent);
    output = binarytofloat64(subprocess[0], subprocess[1]);
    document.getElementById('output-binary-text').innerHTML = output;
}


