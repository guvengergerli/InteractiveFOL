# **Using SWI-Prolog for Resolution Example**

This guide explains how to set up **SWI-Prolog** and run the provided resolution example code.

## **Step 1: Download and Install SWI-Prolog**

1. **Download SWI-Prolog**:
    - Visit the [SWI-Prolog official website](https://www.swi-prolog.org/Download.html).

2. **Verify Installation**:
    - After installation, open your terminal and type:
      ```bash
      swipl
      ```
    - If SWI-Prolog is installed correctly, this command will open the SWI-Prolog interactive prompt.

## **Step 2: Running Prolog Code in the Terminal**


1. **Open SWI-Prolog in the Terminal**:
    - In the terminal, navigate to the directory where your Prolog file is located.
    - Start SWI-Prolog by typing:
      ```bash
      swipl
      ```

2. **Load the Prolog File**:
    - Once SWI-Prolog is running, load your Prolog file by typing:
      ```prolog
      ?- consult('resolution.pl').
      ```
    - This command will load the file and make the predicates available for execution.

3. **Run the Resolution**:
    - After loading the file, you can run the resolution by typing:
      ```prolog
      ?- resolution.
      ```

    - The program will resolve complementary literals in the clauses and display the result.