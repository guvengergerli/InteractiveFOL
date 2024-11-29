document.getElementById("convert-btn").addEventListener("click", async function () {
    const formula = document.getElementById("formula").value;

    // Make a POST request to the backend
    try {
        const response = await fetch('http://localhost:3000/convert-to-cnf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formula }),
        });

        if (!response.ok) {
            throw new Error('Failed to convert formula');
        }

        const data = await response.json();

        if (data.success) {
            const steps = data.steps;

            // Display readable versions for all steps
            document.getElementById("step0-result").textContent = steps.step0.readable || 'N/A';
            document.getElementById("step1-result").textContent = steps.step1.readable || 'N/A';
            document.getElementById("step2-result").textContent = steps.step2.readable || 'N/A';
            document.getElementById("step3-result").textContent = steps.step3.readable || 'N/A';
            document.getElementById("step4-result").textContent = steps.step4.readable || 'N/A';
            document.getElementById("step5-result").textContent = steps.step5.readable || 'N/A';

            // Display individual clauses generated from CNF
            const clauseContainer = document.getElementById("clauses");
            clauseContainer.innerHTML = `<h4>Clauses:</h4>`; // Add a heading
            steps.step5.clauses.forEach((clause, index) => {
                const clauseElement = document.createElement("div");
                clauseElement.textContent = `Clause ${index + 1}: ${clause}`;
                clauseElement.className = 'clause';
                clauseElement.addEventListener("click", function () {
                    clauseElement.classList.toggle("selected");
                });
                clauseContainer.appendChild(clauseElement);
            });
        } else {
            alert('Error in processing formula: ' + data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to connect to the backend!');
    }
});

document.getElementById("resolution-btn").addEventListener("click", function () {
    // Simulate clause resolution process
    let newClauseContainer = document.getElementById("new-clauses");
    newClauseContainer.innerHTML = '';
    for (let i = 1; i <= 2; i++) {
        let newClause = document.createElement("div");
        newClause.textContent = `New Clause ${i}: Some resolved CNF part`;
        newClauseContainer.appendChild(newClause);
    }
});
