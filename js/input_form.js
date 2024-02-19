const inputs = document.querySelectorAll('.input-group input');

inputs.forEach((input) => {
    input.addEventListener('focus', function() {
        this.parentElement.querySelector('label').classList.add('label-change');
    });

    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.parentElement.querySelector('label').classList.remove('label-change');
        }
    });
});
