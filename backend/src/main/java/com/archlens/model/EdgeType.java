package com.archlens.model;

public enum EdgeType {
    CALLS,
    INJECTS,
    IMPORTS,
    EXPOSES,
    IMPLEMENTS,
    EXTENDS,
    WRITES_TO,
    READS_FROM,
    PUBLISHES_EVENT,
    CONSUMES_EVENT
}
