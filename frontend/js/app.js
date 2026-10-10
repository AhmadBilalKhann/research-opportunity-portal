/**
 * University Research Opportunity Portal
 * =======================================
 * Frontend JavaScript — Stage 6 (Static UI)
 *
 * This file sets up:
 *   1. DOM references to all UI elements
 *   2. Form validation (runs entirely in the browser)
 *   3. Placeholder event handlers for every user action
 *      (actual fetch() calls to the API will be added in Stage 7)
 *
 * NO real data is fetched here. NO records are hard-coded.
 * The UI is fully wired and ready for API integration.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================================================================
  // 1. DOM REFERENCES
  // ================================================================

  // Form elements
  const opportunityForm    = document.getElementById('opportunity-form');
  const opportunityIdInput = document.getElementById('opportunity-id');
  const titleInput         = document.getElementById('title');
  const researchAreaInput  = document.getElementById('research_area');
  const facultyNameInput   = document.getElementById('faculty_name');
  const departmentInput    = document.getElementById('department');
  const positionsInput     = document.getElementById('available_positions');
  const deadlineInput      = document.getElementById('application_deadline');
  const statusSelect       = document.getElementById('status');
  const skillsInput        = document.getElementById('required_skills');
  const descriptionInput   = document.getElementById('description');

  // Form header and buttons
  const formTitle      = document.getElementById('form-title');
  const formDescription = document.getElementById('form-description');
  const submitBtn      = document.getElementById('submit-btn');
  const cancelEditBtn  = document.getElementById('cancel-edit-btn');

  // List section
  const opportunitiesList = document.getElementById('opportunities-list');
  const emptyState        = document.getElementById('empty-state');
  const refreshBtn        = document.getElementById('refresh-btn');

  // Details modal
  const detailsModal          = document.getElementById('details-modal');
  const closeDetailsBtn       = document.getElementById('close-details-btn');
  const detailsDismissBtn     = document.getElementById('details-dismiss-btn');
  const detailsToggleStatusBtn = document.getElementById('details-toggle-status-btn');
  const detailsDeleteBtn      = document.getElementById('details-delete-btn');
  const detailsEditBtn        = document.getElementById('details-edit-btn');

  // Details modal fields
  const detailsTitle       = document.getElementById('details-title');
  const detailsStatus      = document.getElementById('details-status');
  const detailsId          = document.getElementById('details-id');
  const detailsFaculty     = document.getElementById('details-faculty');
  const detailsDepartment  = document.getElementById('details-department');
  const detailsArea        = document.getElementById('details-area');
  const detailsPositions   = document.getElementById('details-positions');
  const detailsDeadline    = document.getElementById('details-deadline');
  const detailsSkills      = document.getElementById('details-skills');
  const detailsDescription = document.getElementById('details-description');

  // Global alert
  const globalAlert   = document.getElementById('global-alert');
  const alertIcon     = document.getElementById('alert-icon');
  const alertMessage  = document.getElementById('alert-message');

  // Confirm delete dialog
  const confirmOverlay   = document.getElementById('confirm-overlay');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn  = document.getElementById('cancel-delete-btn');

  // ================================================================
  // 2. STATE
  // ================================================================

  // Tracks the opportunity currently displayed in the details modal.
  // Will hold the full API response object when API integration is added.
  let currentOpportunityId = null;
  let alertTimer = null;

  // ================================================================
  // 3. UTILITY FUNCTIONS
  // ================================================================

  /**
   * showAlert - displays a dismissing success or error banner.
   * @param {string} message  - human-readable message to display
   * @param {string} type     - 'success' or 'error'
   */
  function showAlert(message, type = 'success') {
    // Clear any running auto-dismiss timer
    if (alertTimer) clearTimeout(alertTimer);

    // Apply correct styling class
    globalAlert.className = `alert alert-${type}`;
    alertIcon.textContent  = type === 'success' ? '✓' : '✗';
    alertMessage.textContent = message;

    // Position the alert inside the main container
    globalAlert.classList.remove('hidden');

    // Auto-dismiss after 4 seconds
    alertTimer = setTimeout(() => {
      globalAlert.classList.add('hidden');
    }, 4000);
  }

  /**
   * hideAlert - immediately hides the alert banner.
   */
  function hideAlert() {
    globalAlert.classList.add('hidden');
    if (alertTimer) clearTimeout(alertTimer);
  }

  /**
   * showFieldError - marks a form field as invalid and shows a message.
   * @param {string} fieldName - the field's name attribute (e.g. 'title')
   * @param {string} message   - the error text to display below the field
   */
  function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    if (field)    field.classList.add('is-invalid');
    if (errorDiv) errorDiv.textContent = message;
  }

  /**
   * clearFieldError - removes invalid state from a single field.
   * @param {string} fieldName - the field's name attribute
   */
  function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const errorDiv = document.getElementById(`error-${fieldName}`);
    if (field)    field.classList.remove('is-invalid');
    if (errorDiv) errorDiv.textContent = '';
  }

  /**
   * clearAllFieldErrors - resets all form fields to their clean state.
   */
  function clearAllFieldErrors() {
    const fieldNames = [
      'title', 'research_area', 'faculty_name', 'department',
      'available_positions', 'application_deadline', 'status',
      'required_skills', 'description'
    ];
    fieldNames.forEach(clearFieldError);
  }

  /**
   * openModal / closeModal - show or hide the details modal overlay.
   */
  function openModal() {
    detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeModal() {
    detailsModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentOpportunityId = null;
  }

  /**
   * openConfirmDialog / closeConfirmDialog - show or hide the delete dialog.
   */
  function openConfirmDialog() {
    confirmOverlay.classList.remove('hidden');
  }

  function closeConfirmDialog() {
    confirmOverlay.classList.add('hidden');
  }

  /**
   * switchToCreateMode - resets the form into "Create" mode.
   */
  function switchToCreateMode() {
    formTitle.textContent       = 'Post New Research Opportunity';
    formDescription.textContent = 'Fill out the form below to create a research opening';
    submitBtn.textContent       = 'Create Opportunity';
    cancelEditBtn.classList.add('hidden');
    opportunityIdInput.value    = '';
    opportunityForm.reset();
    clearAllFieldErrors();
    hideAlert();
  }

  /**
   * switchToEditMode - pre-fills the form with existing data for editing.
   * @param {object} opportunity - the opportunity data object from the API response
   *
   * NOTE (Stage 7): the 'opportunity' parameter will be a real API response object.
   * The field names match exactly what the API returns.
   */
  function switchToEditMode(opportunity) {
    formTitle.textContent       = 'Update Research Opportunity';
    formDescription.textContent = `Editing opportunity ID: ${opportunity.id}`;
    submitBtn.textContent       = 'Save Changes';
    cancelEditBtn.classList.remove('hidden');

    // Pre-fill all form fields with existing values
    opportunityIdInput.value     = opportunity.id;
    titleInput.value             = opportunity.title              || '';
    researchAreaInput.value      = opportunity.research_area      || '';
    facultyNameInput.value       = opportunity.faculty_name       || '';
    departmentInput.value        = opportunity.department         || '';
    positionsInput.value         = opportunity.available_positions || '';
    deadlineInput.value          = opportunity.application_deadline || '';
    statusSelect.value           = opportunity.status             || 'Open';
    skillsInput.value            = opportunity.required_skills    || '';
    descriptionInput.value       = opportunity.description        || '';

    clearAllFieldErrors();
    hideAlert();

    // Scroll to the form so the user sees it
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * populateDetailsModal - fills in all the details modal fields.
   * @param {object} opportunity - data object (will come from API in Stage 7)
   */
  function populateDetailsModal(opportunity) {
    detailsTitle.textContent      = opportunity.title;
    detailsId.textContent         = `#${opportunity.id}`;
    detailsFaculty.textContent    = opportunity.faculty_name;
    detailsDepartment.textContent = opportunity.department;
    detailsArea.textContent       = opportunity.research_area;
    detailsPositions.textContent  = opportunity.available_positions;
    detailsDeadline.textContent   = opportunity.application_deadline;
    detailsSkills.textContent     = opportunity.required_skills;
    detailsDescription.textContent = opportunity.description;

    // Apply correct status badge style
    const isOpen = opportunity.status === 'Open';
    detailsStatus.textContent = opportunity.status;
    detailsStatus.className   = `status-badge ${isOpen ? 'status-open' : 'status-closed'}`;

    // Update the toggle-status button label to show what clicking it will do
    detailsToggleStatusBtn.textContent = isOpen ? 'Mark as Closed' : 'Mark as Open';
  }

  // ================================================================
  // 4. FORM VALIDATION
  // ================================================================

  /**
   * validateForm
   * Checks all required fields and returns true only if the form is valid.
   * Each invalid field gets an inline error message.
   *
   * Returns: { valid: boolean }
   */
  function validateForm() {
    clearAllFieldErrors();
    let valid = true;

    // Title
    if (!titleInput.value.trim()) {
      showFieldError('title', 'Research title is required.');
      valid = false;
    }

    // Research Area
    if (!researchAreaInput.value.trim()) {
      showFieldError('research_area', 'Research area is required.');
      valid = false;
    }

    // Faculty Name
    if (!facultyNameInput.value.trim()) {
      showFieldError('faculty_name', "Faculty member's name is required.");
      valid = false;
    }

    // Department
    if (!departmentInput.value.trim()) {
      showFieldError('department', 'Department is required.');
      valid = false;
    }

    // Available Positions
    const positionsValue = Number(positionsInput.value);
    if (!positionsInput.value.trim()) {
      showFieldError('available_positions', 'Number of available positions is required.');
      valid = false;
    } else if (!Number.isInteger(positionsValue) || positionsValue < 1) {
      showFieldError('available_positions', 'Must be a positive whole number (e.g. 1, 2, 3).');
      valid = false;
    }

    // Application Deadline
    if (!deadlineInput.value) {
      showFieldError('application_deadline', 'Application deadline is required.');
      valid = false;
    }

    // Status
    const statusValue = statusSelect.value;
    if (statusValue !== 'Open' && statusValue !== 'Closed') {
      showFieldError('status', 'Status must be Open or Closed.');
      valid = false;
    }

    // Required Skills
    if (!skillsInput.value.trim()) {
      showFieldError('required_skills', 'Required skills are required.');
      valid = false;
    }

    // Description
    if (!descriptionInput.value.trim()) {
      showFieldError('description', 'Research description is required.');
      valid = false;
    }

    return valid;
  }

  // Clear each field's error as soon as the user starts correcting it
  [
    titleInput, researchAreaInput, facultyNameInput, departmentInput,
    positionsInput, deadlineInput, statusSelect, skillsInput, descriptionInput
  ].forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field.name || field.id));
    field.addEventListener('change', () => clearFieldError(field.name || field.id));
  });

  // ================================================================
  // 5. PLACEHOLDER EVENT HANDLERS
  //    (Actual API fetch() calls will be added in Stage 7)
  // ================================================================

  /**
   * FORM SUBMIT — Create or Update
   */
  opportunityForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Run client-side validation first
    const isValid = validateForm();
    if (!isValid) return;

    const isEditMode = opportunityIdInput.value !== '';

    if (isEditMode) {
      // ---- PLACEHOLDER: PUT /api/opportunities/:id ----
      // Stage 7 will replace this comment with:
      //   const id = opportunityIdInput.value;
      //   fetch(`/api/opportunities/${id}`, { method: 'PUT', ... })
      console.log('PLACEHOLDER: Update opportunity ID', opportunityIdInput.value);
      showAlert('(Stage 7) Update will be sent to API here.', 'success');
    } else {
      // ---- PLACEHOLDER: POST /api/opportunities ----
      // Stage 7 will replace this comment with:
      //   fetch('/api/opportunities', { method: 'POST', ... })
      console.log('PLACEHOLDER: Create new opportunity');
      showAlert('(Stage 7) Create will be sent to API here.', 'success');
    }
  });

  /**
   * CANCEL EDIT — switch back to create mode
   */
  cancelEditBtn.addEventListener('click', () => {
    switchToCreateMode();
  });

  /**
   * REFRESH / LOAD OPPORTUNITIES LIST
   */
  refreshBtn.addEventListener('click', () => {
    // ---- PLACEHOLDER: GET /api/opportunities ----
    // Stage 7 will replace this with:
    //   fetch('/api/opportunities').then(res => res.json()).then(renderOpportunityList)
    console.log('PLACEHOLDER: Fetch all opportunities');
    showAlert('(Stage 7) Opportunities will load from API here.', 'success');
  });

  /**
   * CLOSE DETAILS MODAL
   */
  closeDetailsBtn.addEventListener('click', closeModal);
  detailsDismissBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the modal container
  detailsModal.addEventListener('click', (event) => {
    if (event.target === detailsModal) closeModal();
  });

  /**
   * TOGGLE STATUS (Open ↔ Closed) — from details modal
   */
  detailsToggleStatusBtn.addEventListener('click', () => {
    if (!currentOpportunityId) return;

    // ---- PLACEHOLDER: PUT /api/opportunities/:id with {status: ...} ----
    // Stage 7 will replace this with:
    //   const newStatus = currentOpportunity.status === 'Open' ? 'Closed' : 'Open';
    //   fetch(`/api/opportunities/${currentOpportunityId}`, {
    //     method: 'PUT',
    //     body: JSON.stringify({ status: newStatus })
    //   })
    console.log('PLACEHOLDER: Toggle status for opportunity ID', currentOpportunityId);
    showAlert('(Stage 7) Status toggle will be sent to API here.', 'success');
    closeModal();
  });

  /**
   * OPEN EDIT FORM — from details modal
   */
  detailsEditBtn.addEventListener('click', () => {
    if (!currentOpportunityId) return;

    // ---- PLACEHOLDER: GET /api/opportunities/:id then switchToEditMode ----
    // Stage 7 will replace this with:
    //   fetch(`/api/opportunities/${currentOpportunityId}`)
    //     .then(res => res.json())
    //     .then(data => { closeModal(); switchToEditMode(data.data); })
    console.log('PLACEHOLDER: Load opportunity for editing, ID', currentOpportunityId);
    closeModal();
    showAlert('(Stage 7) Edit form will be pre-filled from API here.', 'success');
  });

  /**
   * DELETE — open confirmation dialog first
   */
  detailsDeleteBtn.addEventListener('click', () => {
    openConfirmDialog();
  });

  /**
   * CONFIRM DELETE — user clicks "Yes, Delete"
   */
  confirmDeleteBtn.addEventListener('click', () => {
    if (!currentOpportunityId) return;

    closeConfirmDialog();

    // ---- PLACEHOLDER: DELETE /api/opportunities/:id ----
    // Stage 7 will replace this with:
    //   fetch(`/api/opportunities/${currentOpportunityId}`, { method: 'DELETE' })
    //     .then(res => res.json())
    //     .then(() => { closeModal(); loadOpportunities(); showAlert('Deleted.', 'success'); })
    console.log('PLACEHOLDER: Delete opportunity ID', currentOpportunityId);
    showAlert('(Stage 7) Delete will be sent to API here.', 'success');
    closeModal();
  });

  /**
   * CANCEL DELETE — user clicks "Cancel"
   */
  cancelDeleteBtn.addEventListener('click', () => {
    closeConfirmDialog();
  });

  /**
   * VIEW DETAILS — clicking a card's "View Details" button (event delegation)
   *
   * Cards are rendered dynamically, so we listen on the parent container.
   * Stage 7 will call GET /api/opportunities/:id when a card is clicked.
   */
  opportunitiesList.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('[data-action="view"]');
    if (!viewBtn) return;

    const id = viewBtn.dataset.id;
    currentOpportunityId = id;

    // ---- PLACEHOLDER: GET /api/opportunities/:id ----
    // Stage 7 will replace this with:
    //   fetch(`/api/opportunities/${id}`)
    //     .then(res => res.json())
    //     .then(data => { populateDetailsModal(data.data); openModal(); })
    console.log('PLACEHOLDER: View details for opportunity ID', id);
    showAlert(`(Stage 7) Details will load from API for ID ${id}.`, 'success');
  });

  // ================================================================
  // 6. INITIALISATION
  // ================================================================

  // Ensure the form starts in Create mode on page load
  switchToCreateMode();

  console.log(
    '%cUniversity Research Opportunity Portal — UI Ready (Stage 6)',
    'color: #0d3b66; font-weight: bold; font-size: 12px;'
  );
  console.log('Stage 7 will connect placeholder handlers to the backend API.');

});
