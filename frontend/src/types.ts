export type Box = [number, number, number, number];

export interface PerDigit {
    digit: number;
    prob: number;
}

export interface PredictResponse {
    predicted: string;
    boxes: Box[];
    per_digit?: PerDigit[];
}
