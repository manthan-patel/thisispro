// ====== Email Service JavaScript ======

class EmailService {
    constructor() {
        this.emailData = [
            // {
            //   id: "1",
            //   name: "Rohan hiteshbhai Sharma",
            //   email: "rohan.sharma1912@gmail.com",
            //   bank: "HDFC",
            //   status: "success",
            // },
            // { id: "2", name: "Ayesha Khan", email: "ayesha.khan04@gmail.com", bank: "BOB", status: "success" },
            // { id: "3", name: "Karan Patel", email: "karan.patel992@gmail.com", bank: "HDFC", status: "success" },
            // { id: "4", name: "Priya Verma", email: "priya.verma1123@gmail.com", bank: "Kotak", status: "success" },
            // { id: "5", name: "Arjun Mehta", email: "arjun.mehta1990@gmail.com", bank: "BOB", status: "failed" },
            // { id: "6", name: "Sneha Reddy", email: "sneha.reddy87@gmail.com", bank: "HDFC", status: "success" },
            // { id: "7", name: "Vikram Singh", email: "vikram.singh456@gmail.com", bank: "BOB", status: "success" },
            // { id: "8", name: "Anita Gupta", email: "anita.gupta789@gmail.com", bank: "Kotak", status: "failed" },
            // { id: "9", name: "Rajesh Kumar", email: "rajesh.kumar321@gmail.com", bank: "HDFC", status: "success" },
            // { id: "10", name: "Deepika Rao", email: "deepika.rao654@gmail.com", bank: "BOB", status: "success" },
            // { id: "11", name: "Amit Joshi", email: "amit.joshi987@gmail.com", bank: "Kotak", status: "success" },
            // { id: "12", name: "Kavya Nair", email: "kavya.nair147@gmail.com", bank: "HDFC", status: "failed" },
        ]

        this.filteredData = [...this.emailData]
        this.selectedEmails = new Set()
        this.currentPage = 1
        this.itemsPerPage = 10 // Keep at 10 but ensure all fit without scrolling
        this.currentFilter = "all"
        this.searchQuery = ""

        // Store attached files for download functionality
        this.attachedFiles = new Map()

        this.init()
        this.setupEventListeners()
        this.setupAnimations()
        this.setupRichTextEditor()
        this.renderTable()
        this.updateStats()
        this.updatePagination()
        
        // Initialize placeholder state for message editor
        if (!this.hasValidMessageContent()) {
            this.messageBody.classList.add('placeholder-active');
        }
    }

    init() {
        this.searchInput = document.getElementById("searchInput")
        this.tableBody = document.getElementById("emailTableBody")
        this.selectAllCheckbox = document.getElementById("selectAll")
        this.notificationContainer = document.getElementById("notificationContainer")

        // Compose form elements
        this.recipientEmail = document.getElementById("recipientEmail")
        this.emailSubject = document.getElementById("emailSubject")
        this.messageBody = document.getElementById("messageBody")
        this.sendEmailBtn = document.getElementById("sendEmailBtn")
        this.discardBtn = document.getElementById("discardBtn")

        // Attachment elements
        this.attachmentsSection = document.getElementById("attachmentsSection")
        this.attachmentsList = document.getElementById("attachmentsList")
        this.attachmentsCount = document.getElementById("attachmentsCount")

        // Control buttons - removed exportBtn
        // this.filterBtn = document.getElementById("filterBtn")
        // this.filterMenu = document.getElementById("filterMenu")
        this.importBtn = document.getElementById("importBtn")
        this.importFileInput = document.getElementById("importFileInput")

        // Pagination elements
        this.prevPageBtn = document.getElementById("prevPageBtn")
        this.nextPageBtn = document.getElementById("nextPageBtn")
        this.paginationNumbers = document.getElementById("paginationNumbers")
        this.paginationInfo = document.getElementById("paginationInfo")
    }

    setupEventListeners() {
        // Search functionality (removed notification)
        this.searchInput.addEventListener("input", (e) => {
            this.searchQuery = e.target.value
            this.handleSearch(e.target.value)
        })

        // Select all checkbox
        this.selectAllCheckbox.addEventListener("change", (e) => {
            this.handleSelectAll(e.target.checked)
        })

        // Compose form
        this.sendEmailBtn.addEventListener("click", () => {
            this.handleComposeEmail()
        })

        this.discardBtn.addEventListener("click", () => {
            this.handleDiscardEmail()
        })

        // Control buttons
        // this.filterBtn.addEventListener("click", (e) => {
        //     e.stopPropagation()
        //     this.toggleDropdown(this.filterMenu)
        // })

        // Filter menu items
        // this.filterMenu.addEventListener("click", (e) => {
        //     if (e.target.classList.contains("dropdown-item")) {
        //         const filter = e.target.dataset.filter
        //         console.log("Filter clicked:", filter) // Debug log
        //         this.handleBankFilter(filter)
        //         this.hideDropdown(this.filterMenu)
        //     }
        // })

        // Enhanced import button - show custom dialog
        this.importBtn.addEventListener("click", () => {
            this.showImportDialog()
        })

        this.importFileInput.addEventListener("change", (e) => {
            this.handleImport(e)
        })

        // Pagination
        this.prevPageBtn.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--
                this.renderTable()
                this.updatePagination()
            }
        })

        this.nextPageBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage)
            if (this.currentPage < totalPages) {
                this.currentPage++
                this.renderTable()
                this.updatePagination()
            }
        })

        // Close dropdowns when clicking outside
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".dropdown")) {
                this.hideAllDropdowns()
            }
        })

        this.tableBody.addEventListener("click", (e) => {
            e.stopPropagation()

            if (e.target.closest(".send-btn")) {
                this.handleSendEmail(e)
            } else if (e.target.closest(".resend-btn")) {
                this.handleResendEmail(e)
            } else if (e.target.closest(".row-checkbox")) {
                this.handleRowSelection(e)
            }
        })

        //this.tableBody.addEventListener("click", (e) => {
        //    e.stopPropagation();

        //    const row = e.target.closest("tr");
        //    const email = row?.querySelector(".email-cell")?.textContent?.trim();
        //    const name = row?.querySelector(".name-cell")?.textContent?.trim();

        //    if (!email) return;

        //    if (e.target.closest(".send-btn")) {
        //        fetch('/Mail/SendMail', {
        //            method: 'POST',
        //            headers: {
        //                'Content-Type': 'application/json',
        //                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
        //            },
        //            body: JSON.stringify({ email, name })
        //        })
        //            .then(res => res.json())
        //            .then(data => {
        //                console.log('SendMail response:', data);
        //                // you can still call your local handler if needed:
        //                this.handleSendEmail(e);
        //            })
        //            .catch(err => {
        //                console.error('Error calling SendMail:', err);
        //            });

        //    } else if (e.target.closest(".resend-btn")) {
        //        this.handleResendEmail(e);
        //    } else if (e.target.closest(".row-checkbox")) {
        //        this.handleRowSelection(e);
        //    }
        //});


        // Event delegation for pagination numbers
        this.paginationNumbers.addEventListener("click", (e) => {
            if (e.target.classList.contains("pagination-number")) {
                const page = Number.parseInt(e.target.dataset.page)
                this.currentPage = page
                this.renderTable()
                this.updatePagination()
            }
        })

        // Add click handler for message editor content (files and links)
        this.messageBody.addEventListener("click", (e) => {
            this.handleMessageBodyClick(e)
        })

        // Add keydown handler for attachment removal
        this.messageBody.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" || e.key === "Delete") {
                this.handleAttachmentKeyRemoval(e)
            }
        })
    }

    // Handle clicks within the message editor
    handleMessageBodyClick(e) {
        // Handle link clicks
        if (e.target.tagName === "A" && e.target.href) {
            // Don't prevent default - let the browser handle the link naturally
            this.showNotification(`Opening link: ${e.target.textContent}`, "success")
            // Don't return here - let the event continue
        }
    }

    // Handle attachment removal with backspace/delete
    handleAttachmentKeyRemoval(e) {
        // This will be handled by the attachment section, not inline content
        // Since we moved attachments to a separate section
    }

    setupAnimations() {
        // Animate sections on load
        const sections = [".table-section", ".compose-section"]
        sections.forEach((selector, index) => {
            const section = document.querySelector(selector)
            section.style.opacity = "0"
            section.style.transform = "translateY(30px)"
            setTimeout(() => {
                section.style.transition = "all 0.8s ease"
                section.style.opacity = "1"
                section.style.transform = "translateY(0)"
            }, index * 200)
        })
    }

    setupRichTextEditor() {
        // Enhanced toolbar button handling
        document.querySelectorAll(".toolbar-btn[data-command]").forEach((btn) => {
            btn.addEventListener("mousedown", (e) => {
                e.preventDefault()
            })

            btn.addEventListener("click", (e) => {
                e.preventDefault()
                const command = btn.dataset.command
                const value = btn.dataset.value || null

                // Ensure the editor is focused
                this.messageBody.focus()

                try {
                    // Execute the command
                    if (command === "fontSize") {
                        document.execCommand(command, false, value)
                    } else if (command === "foreColor") {
                        document.execCommand(command, false, value)
                    } else if (command === "fontName") {
                        document.execCommand(command, false, value)
                    } else {
                        document.execCommand(command, false, value)
                    }

                    // Update button states after command execution
                    setTimeout(() => {
                        this.updateToolbarStates()
                    }, 10)
                } catch (error) {
                    console.error("Error executing command:", command, error)
                }
            })
        })

        // Dropdown toggles
        document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
            toggle.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                const menu = toggle.nextElementSibling
                this.toggleDropdown(menu)
            })
        })

        // Dropdown items
        document.querySelectorAll(".dropdown-item[data-command]").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault()
                const command = item.dataset.command
                const value = item.dataset.value

                this.messageBody.focus()

                try {
                    document.execCommand(command, false, value)
                    setTimeout(() => {
                        this.updateToolbarStates()
                    }, 10)
                } catch (error) {
                    console.error("Error executing dropdown command:", command, error)
                }

                this.hideAllDropdowns()
            })
        })

        // Color items
        document.querySelectorAll(".color-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault()
                const command = item.dataset.command
                const value = item.dataset.value

                this.messageBody.focus()

                try {
                    document.execCommand(command, false, value)
                    setTimeout(() => {
                        this.updateToolbarStates()
                    }, 10)
                } catch (error) {
                    console.error("Error executing color command:", command, error)
                }

                this.hideAllDropdowns()
            })
        })

        // Handle placeholder behavior for message editor
        this.messageBody.addEventListener('focus', () => {
            if (!this.hasValidMessageContent()) {
                this.messageBody.classList.remove('placeholder-active');
            }
        });

        this.messageBody.addEventListener('blur', () => {
            if (!this.hasValidMessageContent()) {
                this.messageBody.classList.add('placeholder-active');
            }
        });

        this.messageBody.addEventListener('input', () => {
            if (this.hasValidMessageContent()) {
                this.messageBody.classList.remove('placeholder-active');
            } else {
                this.messageBody.classList.add('placeholder-active');
            }
        });

        // Enhanced Attach File functionality
        document.getElementById("attachFileBtn").addEventListener("click", () => {
            const input = document.createElement("input")
            input.type = "file"
            input.multiple = true
            input.accept = "*/*"

            input.onchange = (e) => {
                const files = Array.from(e.target.files)
                if (files.length > 0) {
                    this.handleFileAttachment(files)
                }
            }

            input.click()
        })

        // Enhanced Insert Link functionality
        document.getElementById("insertLinkBtn").addEventListener("click", () => {
            this.showLinkDialog()
        })

        // Add event listeners for editor state changes
        this.messageBody.addEventListener("keyup", () => {
            this.updateToolbarStates()
        })

        this.messageBody.addEventListener("mouseup", () => {
            this.updateToolbarStates()
        })

        this.messageBody.addEventListener("focus", () => {
            this.updateToolbarStates()
        })

        // Handle input changes to update toolbar states
        this.messageBody.addEventListener("input", () => {
            setTimeout(() => {
                this.updateToolbarStates()
            }, 10)
        })
    }

    // New method to update toolbar button states based on current selection
    updateToolbarStates() {
        const commands = [
            "bold",
            "italic",
            "underline",
            "strikeThrough",
            "justifyLeft",
            "justifyCenter",
            "justifyRight",
            "insertUnorderedList",
            "insertOrderedList",
        ]

        commands.forEach((command) => {
            const btn = document.querySelector(`[data-command="${command}"]`)
            if (btn) {
                try {
                    const isActive = document.queryCommandState(command)
                    if (isActive) {
                        btn.classList.add("active")
                    } else {
                        btn.classList.remove("active")
                    }
                } catch (error) {
                    // Some commands might not be supported, ignore errors
                    btn.classList.remove("active")
                }
            }
        })
    }

    // Enhanced method for handling file attachments - now adds to dedicated section
    handleFileAttachment(files) {
        files.forEach((file) => {
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            // Store the file for later download
            this.attachedFiles.set(fileId, {
                blob: file,
                name: file.name,
                type: file.type,
                size: file.size,
            })

            // Create attachment item for the dedicated section
            this.addAttachmentToSection(fileId, file)

            // Show appropriate message based on file type
            const fileType = file.type.startsWith("image/") ? "Image" : "File"
            this.showNotification(`${fileType} "${file.name}" attached successfully`, "success")
        })

        // Update attachments section visibility and count
        this.updateAttachmentsSection()
    }

    // Add attachment to the dedicated attachments section
    addAttachmentToSection(fileId, file) {
        const attachmentItem = document.createElement("div")
        attachmentItem.className = "attachment-item"
        attachmentItem.dataset.fileId = fileId

        const icon = document.createElement("i")
        icon.className = this.getFileIcon(file.type)

        const attachmentInfo = document.createElement("div")
        attachmentInfo.className = "attachment-info"

        const fileName = document.createElement("div")
        fileName.className = "attachment-name"
        fileName.textContent = file.name
        fileName.title = file.name

        const fileSize = document.createElement("div")
        fileSize.className = "attachment-size"
        fileSize.textContent = this.formatFileSize(file.size)

        const removeBtn = document.createElement("button")
        removeBtn.className = "attachment-remove"
        removeBtn.innerHTML = '<i class="fas fa-times"></i>'
        removeBtn.title = "Remove attachment"

        attachmentInfo.appendChild(fileName)
        attachmentInfo.appendChild(fileSize)

        attachmentItem.appendChild(icon)
        attachmentItem.appendChild(attachmentInfo)
        attachmentItem.appendChild(removeBtn)

        // Add click handler for download
        attachmentItem.addEventListener("click", (e) => {
            if (!e.target.closest(".attachment-remove")) {
                const fileData = this.attachedFiles.get(fileId)
                if (fileData) {
                    this.downloadFile(fileData.blob, fileData.name)
                    this.showNotification(`Downloading ${fileData.name}`, "success")
                }
            }
        })

        // Add remove handler
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation()
            this.removeAttachment(fileId)
        })

        this.attachmentsList.appendChild(attachmentItem)
    }

    // Remove attachment
    removeAttachment(fileId) {
        // Remove from storage
        this.attachedFiles.delete(fileId)

        // Remove from DOM
        const attachmentItem = document.querySelector(`[data-file-id="${fileId}"]`)
        if (attachmentItem) {
            attachmentItem.remove()
        }

        // Update section
        this.updateAttachmentsSection()

        this.showNotification("Attachment removed", "success")
    }

    // Update attachments section visibility and count
    updateAttachmentsSection() {
        const count = this.attachedFiles.size
        this.attachmentsCount.textContent = count

        if (count > 0) {
            this.attachmentsSection.style.display = "block"
        } else {
            this.attachmentsSection.style.display = "none"
        }
    }

    // Download/open file function
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.target = "_blank"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Add method to get appropriate file icon
    getFileIcon(fileType) {
        if (fileType.includes("pdf")) return "fas fa-file-pdf"
        if (fileType.includes("word") || fileType.includes("document")) return "fas fa-file-word"
        if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "fas fa-file-excel"
        if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "fas fa-file-powerpoint"
        if (fileType.includes("zip") || fileType.includes("rar")) return "fas fa-file-archive"
        if (fileType.includes("video")) return "fas fa-file-video"
        if (fileType.includes("audio")) return "fas fa-file-audio"
        if (fileType.includes("image")) return "fas fa-file-image"
        return "fas fa-file"
    }

    // Add method to format file size
    formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    // Add method to insert content at cursor position
    insertAtCursor(element) {
        this.messageBody.focus()

        const selection = window.getSelection()
        let range

        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0)
        } else {
            // Create a new range at the end of the content
            range = document.createRange()
            range.selectNodeContents(this.messageBody)
            range.collapse(false)
        }

        // Delete any selected content
        range.deleteContents()

        // Insert the new element
        range.insertNode(element)

        // Move cursor after the inserted element
        range.setStartAfter(element)
        range.setEndAfter(element)

        // Update selection
        selection.removeAllRanges()
        selection.addRange(range)

        // Trigger input event to update any listeners
        this.messageBody.dispatchEvent(new Event("input", { bubbles: true }))
    }

    // Show enhanced import dialog
    showImportDialog() {
        // Remove existing dialog if any
        const existingDialog = document.getElementById("importDialog")
        if (existingDialog) {
            existingDialog.remove()
        }

        // Create dialog overlay
        const overlay = document.createElement("div")
        overlay.id = "importDialog"
        overlay.className = "import-dialog"

        // Create dialog content
        const dialog = document.createElement("div")
        dialog.className = "import-dialog-content"

        dialog.innerHTML = `
    <button class="import-dialog-close" id="closeImportBtn">
      <i class="fas fa-times"></i>
    </button>
    
    <div class="import-dialog-header">
      <i class="fas fa-cloud-upload-alt"></i>
      <h3>Import Data</h3>
    </div>
    
    <div class="drag-drop-area" id="dragDropArea">
      <div class="drag-drop-icon">
        <i class="fas fa-cloud-upload-alt"></i>
      </div>
      <div class="drag-drop-text">Drag and drop your Excel files here</div>
      <div class="drag-drop-subtext">Or click to select Excel files</div>
      <button class="import-dialog-btn primary" id="selectFilesBtn">
        <i class="fas fa-folder-open"></i>
        Select Files
      </button>
    </div>

    <div class="file-preview-section" id="filePreviewSection">
      <div class="file-preview-header">
        <i class="fas fa-file-excel"></i>
        <span>Selected Files</span>
        <span class="file-count" id="fileCount">0</span>
      </div>
      <div class="file-preview-list" id="filePreviewList"></div>
    </div>

    <div class="import-dialog-actions">
      <button class="import-dialog-btn primary" id="applyImportBtn" disabled>
        <i class="fas fa-check"></i>
        Apply 
      </button>
    </div>
  `

        overlay.appendChild(dialog)
        document.body.appendChild(overlay)

        // Get elements
        const dragDropArea = document.getElementById("dragDropArea")
        const selectFilesBtn = document.getElementById("selectFilesBtn")
        const closeImportBtn = document.getElementById("closeImportBtn")
        const applyImportBtn = document.getElementById("applyImportBtn")
        const filePreviewSection = document.getElementById("filePreviewSection")
        const filePreviewList = document.getElementById("filePreviewList")
        const fileCount = document.getElementById("fileCount")

        // Store selected files
        const selectedFiles = []

        // Update file preview display
        const updateFilePreview = () => {
            filePreviewList.innerHTML = ""
            fileCount.textContent = selectedFiles.length

            if (selectedFiles.length > 0) {
                filePreviewSection.style.display = "block"
                applyImportBtn.disabled = false
                applyImportBtn.style.opacity = "1"
                applyImportBtn.style.cursor = "pointer"
            } else {
                filePreviewSection.style.display = "none"
                applyImportBtn.disabled = true
                applyImportBtn.style.opacity = "0.5"
                applyImportBtn.style.cursor = "not-allowed"
            }

            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement("div")
                fileItem.className = "file-preview-item"
                fileItem.innerHTML = `
        <div class="file-preview-icon">
          <i class="fas fa-file-excel"></i>
        </div>
        <div class="file-preview-info">
          <div class="file-preview-name">${file.name}</div>
          <div class="file-preview-size">${this.formatFileSize(file.size)}</div>
        </div>
        <button class="file-preview-remove" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `

                // Add remove handler
                const removeBtn = fileItem.querySelector(".file-preview-remove")
                removeBtn.addEventListener("click", () => {
                    selectedFiles.splice(index, 1)
                    updateFilePreview()
                })

                filePreviewList.appendChild(fileItem)
            })
        }

        // Handle file selection (both drag/drop and file picker)
        const handleFileSelection = (files) => {
            const validFiles = Array.from(files).filter((file) => {
                const fileName = file.name.toLowerCase()
                if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
                    this.showNotification(`"${file.name}" is not an Excel file and will be ignored`, "warning")
                    return false
                }
                return true
            })

            if (validFiles.length === 0) {
                this.showNotification("Please select valid Excel files", "error")
                return
            }

            // Add new files to selected files (avoid duplicates)
            validFiles.forEach((file) => {
                const isDuplicate = selectedFiles.some(
                    (existingFile) => existingFile.name === file.name && existingFile.size === file.size,
                )
                if (!isDuplicate) {
                    selectedFiles.push(file)
                }
            })

            updateFilePreview()
            this.showNotification(`${validFiles.length} Excel file(s) selected for import`, "success")
        }

        // Setup drag and drop
        this.setupDragAndDrop(dragDropArea, handleFileSelection)

        // Handle file selection button
        selectFilesBtn.addEventListener("click", () => {
            const input = document.createElement("input")
            input.type = "file"
            input.multiple = true
            input.accept = ".xlsx,.xls"

            input.onchange = (e) => {
                const files = Array.from(e.target.files)
                if (files.length > 0) {
                    handleFileSelection(files)
                }
            }

            input.click()
        })

        // Handle Apply button
        applyImportBtn.addEventListener("click", () => {
            if (selectedFiles.length > 0) {
                this.processImportFiles(selectedFiles)
                overlay.remove()
            }
        })

        // Handle close buttons
        closeImportBtn.addEventListener("click", () => {
            overlay.remove()
        })

        // Handle overlay click to close
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove()
            }
        })

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                overlay.remove()
                document.removeEventListener("keydown", handleEscape)
            }
        }
        document.addEventListener("keydown", handleEscape)

        // Initialize preview
        updateFilePreview()
    }

    // Setup drag and drop functionality
    setupDragAndDrop(dragDropArea, onFilesSelected) {
        // Prevent default drag behaviors
        ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            dragDropArea.addEventListener(eventName, (e) => {
                e.preventDefault()
                e.stopPropagation()
            })
        })

            // Highlight drop area when item is dragged over it
            ;["dragenter", "dragover"].forEach((eventName) => {
                dragDropArea.addEventListener(eventName, () => {
                    dragDropArea.classList.add("drag-over")
                })
            })
            ;["dragleave", "drop"].forEach((eventName) => {
                dragDropArea.addEventListener(eventName, () => {
                    dragDropArea.classList.remove("drag-over")
                })
            })

        // Handle dropped files
        dragDropArea.addEventListener("drop", (e) => {
            const files = Array.from(e.dataTransfer.files)
            if (onFilesSelected) {
                onFilesSelected(files)
            }
        })
    }

    // Process import files (called when Apply button is clicked)
    processImportFiles(files) {
        if (files.length === 0) return

        const validFiles = files.filter((file) => {
            const fileName = file.name.toLowerCase()
            return fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
        })

        if (validFiles.length === 0) {
            this.showNotification("Please select valid Excel files", "error")
            return
        }

        let processedCount = 0
        const totalFiles = validFiles.length
        let totalImportedRecords = 0

        validFiles.forEach((file) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result)
                    const workbook = window.XLSX.read(data, { type: "array" })

                    // Get the first worksheet
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]

                    // Convert to JSON
                    const importedData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 })

                    // Process the data (assuming first row is headers)
                    const headers = importedData[0]
                    const processedData = []

                    for (let i = 1; i < importedData.length; i++) {
                        if (importedData[i] && importedData[i].length > 0) {
                            const record = {}
                            headers.forEach((header, index) => {
                                if (header && importedData[i][index] !== undefined) {
                                    record[header.toLowerCase().trim()] = String(importedData[i][index]).trim()
                                }
                            })
                            if (Object.keys(record).length > 0) {
                                processedData.push(record)
                            }
                        }
                    }

                    // Get current max ID to ensure proper sequential numbering
                    const currentMaxId =
                        this.emailData.length > 0 ? Math.max(...this.emailData.map((item) => Number.parseInt(item.id) || 0)) : 0

                    // Add imported data to existing data with proper sequential IDs
                    processedData.forEach((item, index) => {
                        const newId = currentMaxId + totalImportedRecords + index + 1
                        this.emailData.push({
                            id: newId.toString(),
                            name: item.name || `User ${newId}`,
                            email: item.email || `user${newId}@example.com`,
                            bank: item.bank || "HDFC",
                            status: item.status || "pending",
                        })
                    })

                    totalImportedRecords += processedData.length
                    processedCount++

                    // Update UI after all files are processed
                    if (processedCount === totalFiles) {
                        this.applyFilters()
                        this.renderTable()
                        this.updatePagination()
                        this.updateStats()

                        this.showNotification(
                            `Successfully imported ${totalImportedRecords} records from ${totalFiles} Excel file(s)!`,
                            "success",
                        )
                    }
                } catch (error) {
                    console.error("Error processing Excel file:", error)
                    this.showNotification(`Error importing ${file.name}. Please check the Excel file format.`, "error")
                    processedCount++
                }
            }

            reader.readAsArrayBuffer(file)
        })
    }

    // Add method to show link dialog
    showLinkDialog() {
        // Get selected text if any
        const selection = window.getSelection()
        const selectedText = selection.toString()

        // Create and show the link dialog
        this.createLinkDialog(selectedText)
    }

    // Add method to create link dialog
    createLinkDialog(selectedText = "") {
        // Remove existing dialog if any
        const existingDialog = document.getElementById("linkDialog")
        if (existingDialog) {
            existingDialog.remove()
        }

        // Create dialog overlay
        const overlay = document.createElement("div")
        overlay.id = "linkDialog"
        overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `

        // Create dialog content
        const dialog = document.createElement("div")
        dialog.style.cssText = `
    background: var(--accent-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius);
    padding: 25px;
    min-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
  `

        dialog.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: var(--text-primary); font-family: var(--font-primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-link" style="color: var(--primary-color);"></i>
        Insert Link
      </h3>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary);">
        <i class="fas fa-font" style="color: var(--primary-color);"></i>
        Text
      </label>
      <input type="text" id="linkText" placeholder="Enter link text..." 
        style="width: 100%; background: var(--glass-bg); border: 2px solid var(--primary-color); border-radius: 8px; padding: 12px 15px; color: var(--text-primary); font-size: 14px; outline: none;"
        value="${selectedText}">
    </div>
    
    <div style="margin-bottom: 25px;">
      <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary);">
        <i class="fas fa-link" style="color: var(--primary-color);"></i>
        Type or paste a link
      </label>
      <input type="url" id="linkUrl" placeholder="https://example.com" 
        style="width: 100%; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px; padding: 12px 15px; color: var(--text-primary); font-size: 14px; outline: none;">
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="cancelLink" style="padding: 10px 20px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; transition: var(--transition);">
        Cancel
      </button>
      <button id="applyLink" style="padding: 10px 20px; background: var(--primary-color); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: var(--transition);">
        Apply
      </button>
    </div>
  `

        overlay.appendChild(dialog)
        document.body.appendChild(overlay)

        // Focus on text input
        const textInput = document.getElementById("linkText")
        const urlInput = document.getElementById("linkUrl")
        textInput.focus()

        // Handle button clicks
        document.getElementById("cancelLink").addEventListener("click", () => {
            overlay.remove()
        })

        document.getElementById("applyLink").addEventListener("click", () => {
            const text = textInput.value.trim()
            const url = urlInput.value.trim()

            if (!text || !url) {
                this.showNotification("Please fill in both text and URL fields", "error")
                return
            }

            if (!this.isValidUrl(url)) {
                this.showNotification("Please enter a valid URL", "error")
                return
            }

            this.insertLink(text, url)
            overlay.remove()
            this.showNotification("Link inserted successfully", "success")
        })

        // Handle overlay click to close
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove()
            }
        })

        // Handle Enter key
        dialog.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.getElementById("applyLink").click()
            } else if (e.key === "Escape") {
                overlay.remove()
            }
        })
    }

    // Add method to validate URL
    isValidUrl(string) {
        try {
            new URL(string)
            return true
        } catch (_) {
            // Try with https:// prefix
            try {
                new URL("https://" + string)
                return true
            } catch (_) {
                return false
            }
        }
    }

    // Enhanced method to insert link
    insertLink(text, url) {
        // Ensure URL has protocol
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url
        }

        const link = document.createElement("a")
        link.href = url
        link.textContent = text
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        link.style.cssText = `
      color: var(--primary-color);
      text-decoration: underline;
      cursor: pointer;
      transition: var(--transition);
    `

        // Add hover effect
        link.addEventListener("mouseenter", () => {
            link.style.color = "var(--secondary-color)"
            link.style.textShadow = "0 0 8px rgba(124, 58, 237, 0.5)"
        })

        link.addEventListener("mouseleave", () => {
            link.style.color = "var(--primary-color)"
            link.style.textShadow = "none"
        })

        // Ensure the link opens properly
        link.addEventListener("click", (e) => {
            // Don't prevent default behavior
            console.log(`Clicking link: ${url}`)
            // Force open if needed
            if (!e.defaultPrevented) {
                window.open(url, "_blank", "noopener,noreferrer")
            }
        })

        // Create a wrapper to ensure proper spacing
        const wrapper = document.createElement("span")
        wrapper.appendChild(link)
        wrapper.appendChild(document.createTextNode(" "))

        this.insertAtCursor(wrapper)
    }

    toggleDropdown(menu) {
        this.hideAllDropdowns()
        menu.classList.toggle("show")
    }

    hideDropdown(menu) {
        menu.classList.remove("show")
    }

    hideAllDropdowns() {
        document.querySelectorAll(".dropdown-menu").forEach((menu) => {
            menu.classList.remove("show")
        })
    }

    applyFilters() {
        let filtered = [...this.emailData]

        // Apply search filter first
        if (this.searchQuery.trim()) {
            const searchTerm = this.searchQuery.toLowerCase().trim()
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.email.toLowerCase().includes(searchTerm) ||
                    item.status.toLowerCase().includes(searchTerm),
            )
        }

        // Apply bank filter
        if (this.currentFilter && this.currentFilter !== "all") {
            console.log("Filtering by bank:", this.currentFilter) // Debug log
            filtered = filtered.filter((item) => {
                const itemBank = item.bank.toLowerCase()
                const filterBank = this.currentFilter.toLowerCase()
                return itemBank === filterBank
            })
        }

        console.log("Filtered data count:", filtered.length) // Debug log
        this.filteredData = filtered
        this.currentPage = 1 // Reset to first page when filtering
    }

    renderTable() {
        this.tableBody.innerHTML = ""

        const startIndex = (this.currentPage - 1) * this.itemsPerPage
        const endIndex = startIndex + this.itemsPerPage
        const pageData = this.filteredData.slice(startIndex, endIndex)

        pageData.forEach((record, index) => {
            const row = this.createTableRow(record, startIndex + index)
            this.tableBody.appendChild(row)
        })

        this.updateSelectAllState()
    }

    createTableRow(record, index) {
        const row = document.createElement("tr")
        row.className = "table-row"
        row.dataset.id = record.id

        const statusClass = record.status
        const statusIcon = this.getStatusIcon(record.status)
        const statusText = record.status.charAt(0).toUpperCase() + record.status.slice(1)

        // Check if this row should be selected
        const isSelected = this.selectedEmails.has(record.id)

        row.innerHTML = `
      <td><input type="checkbox" class="checkbox row-checkbox" data-id="${record.id}"${this.selectedEmails.has(record.id) ? "checked" : ""}></td>
      <td><span class="id-badge">${index + 1}</span></td>
      <td class="name-cell">
        <span>${record.name}</span>
      </td>
      <td class="email-cell">${record.email}</td>
      <td><span class="status-badge ${statusClass}">
        <i class="fas fa-${statusIcon}"></i>
        ${statusText}
      </span></td>
      <td class="actions-cell" method="post" asp-controller="Mail" asp-action="SendMail">
        <button class="action-btn send-btn" title="Send" data-email="${record.email}">
          <i class="fas fa-paper-plane"></i>
        </button>
        <button class="action-btn resend-btn" title="Resend" data-email="${record.email}">
          <i class="fas fa-redo"></i>
        </button>
      </td>
    `

        // Animate row appearance
        row.style.opacity = "0"
        row.style.transform = "translateX(-20px)"
        setTimeout(() => {
            row.style.transition = "all 0.5s ease"
            row.style.opacity = "1"
            row.style.transform = "translateX(0)"
        }, index * 50)

        return row
    }


    handleCheckboxChange(e) {
        const checkbox = e.target;
        const id = checkbox.dataset.id;

        if (checkbox.checked) {
            this.selectedEmails.add(id); // Add selected
        } else {
            this.selectedEmails.delete(id); // Remove unselected
        }

        this.updateSelectAllState();
    }




    updatePagination() {
        const totalItems = this.filteredData.length
        const totalPages = Math.ceil(totalItems / this.itemsPerPage)
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems)

        // Update pagination info
        this.paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} entries`

        // Update pagination buttons
        this.prevPageBtn.disabled = this.currentPage === 1
        this.nextPageBtn.disabled = this.currentPage === totalPages || totalPages === 0

        // Smart pagination with ellipsis
        this.paginationNumbers.innerHTML = ""

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                this.createPageButton(i)
            }
        } else {
            // Smart pagination with ellipsis
            if (this.currentPage <= 4) {
                // Show: 1 2 3 4 5 ... last
                for (let i = 1; i <= 5; i++) {
                    this.createPageButton(i)
                }
                this.createEllipsis()
                this.createPageButton(totalPages)
            } else if (this.currentPage >= totalPages - 3) {
                // Show: 1 ... (last-4) (last-3) (last-2) (last-1) last
                this.createPageButton(1)
                this.createEllipsis()
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    this.createPageButton(i)
                }
            } else {
                // Show: 1 ... (current-1) current (current+1) ... last
                this.createPageButton(1)
                this.createEllipsis()
                for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
                    this.createPageButton(i)
                }
                this.createEllipsis()
                this.createPageButton(totalPages)
            }
        }
    }

    // Helper method to create page buttons
    createPageButton(pageNum) {
        const btn = document.createElement("button")
        btn.className = `pagination-number ${pageNum === this.currentPage ? "active" : ""}`
        btn.dataset.page = pageNum
        btn.textContent = pageNum
        this.paginationNumbers.appendChild(btn)
    }

    // Helper method to create ellipsis
    createEllipsis() {
        const ellipsis = document.createElement("span")
        ellipsis.className = "pagination-ellipsis"
        ellipsis.textContent = "..."
        ellipsis.style.cssText = `
    color: var(--text-secondary);
    padding: 8px 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  `
        this.paginationNumbers.appendChild(ellipsis)
    }

    getStatusIcon(status) {
        const icons = {
            success: "check-circle",
            failed: "times-circle",
            pending: "clock",
        }
        return icons[status] || "question-circle"
    }

    handleSearch(query) {
        this.searchQuery = query
        this.applyFilters()
        this.renderTable()
        this.updatePagination()
        // Removed notification for search
    }

    handleBankFilter(filter) {
        console.log("Applying filter:", filter) // Debug log

        // Update current filter state
        this.currentFilter = filter

        // Update the filter button text to show current filter
        // const filterBtnText = this.filterBtn.querySelector("span")
        // if (filterBtnText) {
        //     filterBtnText.textContent = filter === "all" ? "All" : filter.toUpperCase()
        // }

        // Apply filters and update display
        this.applyFilters()
        this.renderTable()
        this.updatePagination()

        // Show notification
        const filterText = filter === "all" ? "All Banks" : filter.toUpperCase()
        this.showNotification(`Filtered by: ${filterText}`, "success")
    }

    handleSelectAll(checked) {
        // Select all emails from the filtered data (respects search conditions)
        if (checked) {
            // Add all filtered emails to selectedEmails set
            this.filteredData.forEach((record) => {
                this.selectedEmails.add(record.id)
            })
        } else {
            // Remove all emails from selectedEmails set
            this.selectedEmails.clear()
        }

        // Update all checkboxes on current page
        const checkboxes = document.querySelectorAll(".row-checkbox")
        checkboxes.forEach((checkbox) => {
            checkbox.checked = checked
            this.animateCheckbox(checkbox)
        })

        // Update select all checkbox state
        this.updateSelectAllState()

        const count = checked ? this.filteredData.length : 0
        const totalCount = this.emailData.length
        let notificationText = ""
        
        if (checked) {
            if (this.searchQuery.trim()) {
                notificationText = `${count} items selected (filtered by "${this.searchQuery}")`
            } else {
                notificationText = `${count} items selected from total ${totalCount} emails`
            }
        } else {
            notificationText = "All selections cleared"
        }
        
        this.showNotification(notificationText, "success")
    }

    handleRowSelection(e) {
        const checkbox = e.target.closest(".row-checkbox")
        if (!checkbox) return

        const id = checkbox.dataset.id

        if (checkbox.checked) {
            this.selectedEmails.add(id)
        } else {
            this.selectedEmails.delete(id)
        }

        this.updateSelectAllState()
        this.animateCheckbox(checkbox)
    }

    updateSelectAllState() {
        const checkboxes = document.querySelectorAll(".row-checkbox")
        const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length
        const totalCount = checkboxes.length

        // Check if all filtered emails are selected (not just current page)
        const allFilteredSelected = this.filteredData.length > 0 && 
            this.filteredData.every((record) => this.selectedEmails.has(record.id))
        
        // Check if some filtered emails are selected
        const someFilteredSelected = this.filteredData.some((record) => this.selectedEmails.has(record.id))

        this.selectAllCheckbox.checked = allFilteredSelected
        this.selectAllCheckbox.indeterminate = someFilteredSelected && !allFilteredSelected

        // Update selected count display
        this.updateSelectedCount()
    }

    updateSelectedCount() {
        const selectedCount = this.selectedEmails.size
        const selectedCountElement = document.getElementById('selectedCount')
        const selectedCountContainer = document.getElementById('selectedCountContainer')
        
        if (selectedCount > 0) {
            selectedCountElement.textContent = selectedCount
            selectedCountContainer.style.display = 'flex'
        } else {
            selectedCountContainer.style.display = 'none'
        }
    }

    async handleSendEmail(e) {
        const button = e.target.closest(".send-btn")
        if (!button) return

        const email = button.dataset.email
        const row = button.closest(".table-row")
        const id = row.dataset.id

        const subject = this.emailSubject.value.trim()
        
        if (!subject) {
            this.showNotification("Please fill in the subject field", "error")
            return
        }

        // Check if message has actual content (not just HTML tags or whitespace)
        const messageText = this.messageBody.innerText || this.messageBody.textContent || '';
        const cleanMessage = messageText.trim();
        
        if (!cleanMessage) {
            this.showNotification("Please compose a message with actual content", "error")
            return
        }

        try {
            const token = document.querySelector('input[name="__RequestVerificationToken"]').value;

            const response = await fetch("/Mail/SendMail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "RequestVerificationToken": token
                },
                body: JSON.stringify({
                    Recipient: email,
                    Subject: subject,
                    Body: this.messageBody.innerHTML
                })
            });

            const record = this.emailData.find((r) => r.id === id);

            if (!response.ok) {
                let errorMsg = "Failed to send";
                try {
                    const error = await response.json();
                    console.log(`Error response for individual email to ${email}:`, error);
                    if (error?.message) errorMsg = error.message;
                } catch (parseError) {
                    console.log(`Failed to parse error response for individual email to ${email}:`, parseError);
                    errorMsg = `Failed to send (Status: ${response.status})`;
                }
                this.showNotification(`Failed: ${errorMsg}`, "error");

                // Update status to failed to allow resend
                const statusBadgeFail = row.querySelector(".status-badge");
                if (statusBadgeFail) {
                    statusBadgeFail.className = "status-badge failed";
                    statusBadgeFail.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
                }
                if (record) {
                    record.status = "failed";
                    this.updateStats();
                }
                return;
            }

            this.showNotification(`Email sent to ${email}`, "success");

            // Update status to success
            const statusBadge = row.querySelector(".status-badge");
            statusBadge.className = "status-badge success";
            statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Success';

            // Update local data
            if (record) {
                record.status = "success";
                this.updateStats();
            }
        } catch (err) {
            this.showNotification(`Error: ${err.message}`, "error");
            // On exception, mark as failed to enable resend
            const row = button.closest(".table-row");
            const id = row?.dataset.id;
            const statusBadge = row?.querySelector(".status-badge");
            if (statusBadge) {
                statusBadge.className = "status-badge failed";
                statusBadge.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
            }
            const record = this.emailData.find((r) => r.id === id);
            if (record) {
                record.status = "failed";
                this.updateStats();
            }
        }
    }


    async handleResendEmail(e) {
        const button = e.target.closest(".resend-btn");
        if (!button) return;

        const email = button.dataset.email;
        const row = button.closest(".table-row");
        const id = row?.dataset.id;

        const subject = this.emailSubject?.value.trim();
        
        if (!subject) {
            this.showNotification("Please fill in the subject field", "error");
            return;
        }

        // Check if message has actual content (not just HTML tags or whitespace)
        const messageText = this.messageBody?.innerText || this.messageBody?.textContent || '';
        const cleanMessage = messageText.trim();
        
        if (!cleanMessage) {
            this.showNotification("Please compose a message with actual content", "error");
            return;
        }

        // Allow resend only if previous attempt failed.
        const record = this.emailData.find((r) => r.id === id);
        const currentStatus = record?.status || "pending";
        if (currentStatus === "pending") {
            this.showNotification("First send the email to this recipient before resending.", "warning");
            return;
        }
        if (currentStatus === "success") {
            this.showNotification("Email already sent successfully. Resend is only allowed for failures.", "warning");
            return;
        }

        try {
            const tokenField = document.querySelector('input[name="__RequestVerificationToken"]');
            const token = tokenField?.value;

            if (!token) {
                this.showNotification("Anti-forgery token not found.", "error");
                return;
            }

            // Optional visual feedback
            this.animateButton(button);

            const response = await fetch("/Mail/SendMail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "RequestVerificationToken": token
                },
                body: JSON.stringify({
                    Recipient: email,
                    Subject: subject,
                    Body: this.messageBody.innerHTML
                })
            });

            if (!response.ok) {
                this.showNotification(`Resend failed for ${email}`, "error");
                console.error("Resend failed:", response.statusText);
                // Keep as failed
                const statusBadgeFail = row.querySelector(".status-badge");
                if (statusBadgeFail) {
                    statusBadgeFail.className = "status-badge failed";
                    statusBadgeFail.innerHTML = '<i class="fas fa-times-circle"></i> Failed';
                }
                return;
            }

            this.showNotification(`Email resent to ${email}`, "success");

            // Update status badge
            const statusBadge = row.querySelector(".status-badge");
            if (statusBadge) {
                statusBadge.className = "status-badge success";
                statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Success';
            }

            // Update local data
            if (record) {
                record.status = "success";
                this.updateStats();
            }

        } catch (err) {
            console.error("Resend exception:", err);
            this.showNotification(`Unexpected error: ${err.message}`, "error");
        }
    }



    async handleComposeEmail() {
        const subject = this.emailSubject.value.trim();
        const message = this.messageBody.innerHTML.trim();

        if (!subject) {
            this.showNotification("Please fill in the subject field", "error");
            return;
        }

        // Check if message has actual content (not just HTML tags or whitespace)
        const messageText = this.messageBody.innerText || this.messageBody.textContent || '';
        const cleanMessage = messageText.trim();
        
        if (!cleanMessage) {
            this.showNotification("Please compose a message with actual content", "error");
            return;
        }

        // Build a unique set of selected IDs from both internal state and currently checked boxes
        const selectedIds = new Set(this.selectedEmails);
        const checkedBoxes = document.querySelectorAll(".row-checkbox:checked");
        checkedBoxes.forEach((checkbox) => {
            if (checkbox?.dataset?.id) selectedIds.add(checkbox.dataset.id);
        });

        // Map unique IDs to records
        const selectedRecipients = this.emailData.filter((record) => selectedIds.has(record.id));

        if (selectedRecipients.length === 0) {
            this.showNotification("Please select at least one recipient from the database", "error");
            return;
        }

        this.animateButton(this.sendEmailBtn);

        this.showNotification(`Sending email to ${selectedRecipients.length} recipient(s)...`, "success");

        try {
            let successCount = 0;
            let failureCount = 0;
            let errorMessages = [];

            // Send each email using controller
            for (const recipient of selectedRecipients) {
                const token = document.querySelector('#antiForgeryForm input[name="__RequestVerificationToken"]').value;

                const response = await fetch("/Mail/SendMail", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "RequestVerificationToken": token
                    },
                    body: JSON.stringify({
                        recipient: recipient.email,
                        subject: subject,
                        body: this.messageBody.innerHTML
                    })
                });

                const record = this.emailData.find((r) => r.id === recipient.id);
                if (response.ok) {
                    if (record) record.status = "success";
                    successCount++;
                } else {
                    if (record) record.status = "failed";
                    failureCount++;
                    
                    // Get error message from response
                    try {
                        const error = await response.json();
                        console.log(`Error response for ${recipient.email}:`, error);
                        if (error?.message) {
                            errorMessages.push(`${recipient.email}: ${error.message}`);
                        } else {
                            errorMessages.push(`${recipient.email}: Failed to send (Status: ${response.status})`);
                        }
                    } catch (parseError) {
                        console.log(`Failed to parse error response for ${recipient.email}:`, parseError);
                        errorMessages.push(`${recipient.email}: Failed to send (Status: ${response.status})`);
                    }
                }
            }

            this.selectedEmails.clear();
            this.applyFilters();
            this.renderTable();
            this.updatePagination();
            this.updateStats();

            document.querySelectorAll(".row-checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });

            if (this.selectAllCheckbox) {
                this.selectAllCheckbox.checked = false;
                this.selectAllCheckbox.indeterminate = false;
            }

            // Show appropriate notification based on results
            if (failureCount === 0) {
                // All emails sent successfully
                this.showNotification(`Email sent successfully to ${successCount} recipient(s)`, "success");
                this.clearComposeForm();
            } else if (successCount === 0) {
                // All emails failed
                this.showNotification(`Failed to send emails. ${errorMessages.join('; ')}`, "error");
            } else {
                // Mixed results
                this.showNotification(`Email sent to ${successCount} recipient(s), failed for ${failureCount} recipient(s)`, "warning");
                if (errorMessages.length > 0) {
                    // Show detailed errors in console for debugging
                    console.log("Email sending errors:", errorMessages);
                }
            }
        } catch (error) {
            this.showNotification("Error while sending email. Please try again.", "error");
        }
    }


    handleDiscardEmail() {
        this.animateButton(this.discardBtn)
        this.clearComposeForm()
        this.showNotification("Email discarded", "success")
    }

    handleImport(e) {
        const files = Array.from(e.target.files)
        // Just show the dialog, don't process files immediately
        this.showImportDialog()
        e.target.value = "" // Reset file input
    }

    clearComposeForm() {
        if (this.recipientEmail) this.recipientEmail.value = ""
        this.emailSubject.value = ""
        
        // Properly clear the rich text editor content
        this.messageBody.innerHTML = ""
        this.messageBody.innerText = ""
        
        // Clear attached files
        this.attachedFiles.clear()
        this.attachmentsList.innerHTML = ""
        this.updateAttachmentsSection()
    }

    updateStats() {
        const totalSent = this.emailData.length
        const successfulSent = this.emailData.filter((r) => r.status === "success").length
        const failedSent = this.emailData.filter((r) => r.status === "failed").length

        document.getElementById("totalSent").textContent = totalSent
        document.getElementById("successfulSent").textContent = successfulSent
        document.getElementById("failedSent").textContent = failedSent
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    hasValidMessageContent() {
        const messageText = this.messageBody.innerText || this.messageBody.textContent || '';
        const cleanMessage = messageText.trim();
        return cleanMessage.length > 0;
    }

    animateButton(button) {
        button.style.transform = "scale(0.95)"
        button.style.opacity = "0.8"

        setTimeout(() => {
            button.style.transform = "scale(1)"
            button.style.opacity = "1"
        }, 150)
    }

    animateCheckbox(checkbox) {
        checkbox.style.transform = "scale(1.2)"
        setTimeout(() => {
            checkbox.style.transform = "scale(1)"
        }, 150)
    }

    animateElement(element) {
        element.style.transform = "translateX(10px)"
        element.style.background = "rgba(124, 58, 237, 0.3)"

        setTimeout(() => {
            element.style.transform = "translateX(0)"
            element.style.background = "rgba(255, 255, 255, 0.05)"
        }, 300)
    }

    showNotification(message, type = "success") {
        const notification = document.createElement("div")
        notification.className = `notification ${type}`
        notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "exclamation-triangle"}"></i>
      <span>${message}</span>
    </div>
  `

        this.notificationContainer.appendChild(notification)

        // Faster auto remove - reduced from 3000ms to 2500ms
        setTimeout(() => {
            notification.style.animation = "slideIn 0.2s ease-out reverse"
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                }
            }, 200) // Reduced from 300ms to 200ms
        }, 2500)
    }
}

// Initialize the Email Service
document.addEventListener("DOMContentLoaded", () => {
    window.XLSX = window.XLSX || require("xlsx")
    new EmailService()

    // Add quantum particle effects
    setInterval(() => {
        const particles = document.querySelectorAll(".particle")
        particles.forEach((particle) => {
            const randomX = Math.random() * 10 - 5
            const randomY = Math.random() * 10 - 5
            particle.style.transform = `translate(${randomX}px, ${randomY}px)`
        })
    }, 3000)
})

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case "k":
                e.preventDefault()
                document.getElementById("searchInput").focus()
                break
            case "Enter":
                if (e.target.closest(".compose-form")) {
                    e.preventDefault()
                    document.getElementById("sendEmailBtn").click()
                }
                break
        }
    }
})
