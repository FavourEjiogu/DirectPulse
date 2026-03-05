import React from 'react';
import { renderToString } from 'react-dom/server';
import Auth from './components/Auth';

const ITERATIONS = 10000;

function runBenchmark() {
    console.log(`Starting benchmark for ${ITERATIONS} iterations...`);
    const start = process.hrtime.bigint();

    for (let i = 0; i < ITERATIONS; i++) {
        renderToString(<Auth onLogin={() => {}} />);
    }

    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;

    console.log(`Total time: ${durationMs.toFixed(2)}ms`);
    console.log(`Average time per render: ${(durationMs / ITERATIONS).toFixed(4)}ms`);
}

runBenchmark();
