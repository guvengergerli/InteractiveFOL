# InteractiveFOL

Interactive FOL Resolution Explorer

The goal of this project is to develop a comprehensive tool as a web page for visualizing the process of First-Order Logic (FOL) resolution. FOL is a fundamental technique in automated reasoning because it allows machines to represent and infer logical statements systematically. In this project, we seek to provide a step-by-step breakdown of how FOL formulas are transformed into Clause Normal Form and illustrate the key unification process using class algorithms.

This tool allows users to explore various strategies (Unit Resolution, Set of Support (SOS), Linear Resolution) for clause selection at each step of the resolution process. Users can mix strategies as they go, visualizing how each choice impacts the outcome and the evolution of learned clauses. This interactivity helps make abstract concepts more concrete by offering a hands-on approach to the logic resolution process.

The project emphasizes interactive visualization, making it a valuable educational tool for logic and computational theory courses. It combines logic, algorithms, and a user-friendly interface to simplify complex processes. By offering different resolution strategies, users gain insights into each approach’s strengths and weaknesses, deepening their understanding of how resolution techniques can be optimized for applications like theorem proving and AI. Notably, no existing webpage offers this combination of functionality and interactivity, designed for easy access by general users.

## **1. Start the Backend**
1. Open a terminal and navigate to the `backend` folder:

    ```bash
    cd backend
    ```

2. Start the server:

    ```bash
    node server.js
    ```

3. Leave the terminal running. The server will be available at:

    ```
    http://localhost:3000
    ```

---

## **2. Open the Frontend**
1. Navigate to the `frontend` folder.
2. Open `index.html` in your browser:
    - If you are using a text editor with a live server feature (e.g., VS Code with Live Server), start the live server.
    - Alternatively, you can directly open `index.html` in your browser by double-clicking it or dragging it into a browser window.

---

## **3. Input the Formula**
1. In the input box labeled **"Put your Formula"**, type the following formulas:
    ```
    implies(every(X, and(P(X), exist(Y, Q(X, Y)))), or(not(R(Z)), and(exist(W, S(W, a)), implies(T(U), and(V(U, X), W(a))))))
    ```
    
    ```
   and(implies(P(X), Q(X)), and(implies(Q(X), R(X)), and(not(P(X)), not(R(X)))))
    ```
   
2. Click the **"Transfer to CNF"** button.

---

## **Reference**
1. Code Reference: https://github.com/nhabbash/clausify/tree/master 
2. Additional Assistance: We utilized ChatGPT as a tool for guidance during code implementation. However, the core logic and ideas were developed independently.