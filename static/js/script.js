document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const predictBtn = document.getElementById('predictBtn');
    const dropText = document.getElementById('dropText');
    const dropIcon = document.getElementById('dropIcon');
    const form = document.getElementById('predictForm');

    // Click to browse
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag & Drop
    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            fileInput.files = files;
            showFile(files[0]);
        }
    });

    // File selected via input
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showFile(fileInput.files[0]);
        }
    });

    function showFile(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatSize(file.size);
        fileInfo.classList.add('visible');
        dropZone.classList.add('has-file');
        dropText.textContent = 'File ready for prediction';
        predictBtn.disabled = false;
    }

    function clearFile() {
        fileInput.value = '';
        fileInfo.classList.remove('visible');
        dropZone.classList.remove('has-file');
        dropText.textContent = 'Drop your CSV file here';
        predictBtn.disabled = true;
    }

    removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        clearFile();
    });

    // Format file size
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Form submit with loading state
    form.addEventListener('submit', () => {
        predictBtn.classList.add('loading');
    });
});
