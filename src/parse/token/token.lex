SINGLE_OPERATOR        [+*()\[\]=/!><;\.\?\:\"\'\~\%\&\^\|\,-]
MULTI_OPERATOR         "++"|"--"|"=="|"==="|"!="|"!=="|">="|"<="|">>"|">>>"|"<<"|"&&"|"||"

NUMBER      \d+[\.\d]*

VARIABLE    [\a$_][\a\d$_]*

SPACE       \s+

OTHER       [\d\D]

$$

SINGLE_OPERATOR {
     __parse_token_type = 'op';
}

MULTI_OPERATOR {
    __parse_token_type = 'op';
}

VARIABLE {
    __parse_token_type = 'var';
}

NUMBER {
    __parse_token_type = 'num';
}

SPACE {
    __parse_token_type = 'emp';
}

OTHER {
    __parse_token_type = 'emp';
}

$$
