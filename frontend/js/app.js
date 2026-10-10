/**
 * University Research Opportunity Portal
 * =======================================
 * Frontend JavaScript — Stage 7 (API Integration)
 *
 * Commit 1: Connect frontend to opportunity list API
 *   - GET /api/opportunities on page load
 *   - Render cards dynamically from database records
 *   - Refresh button reloads list from API
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================================================================
  // 1. CONFIGURATION
  // ================================================================

  const API_BASE = '/api/opportunities';

  // ================================================================
  // 2. DOM REFERENCES
  // ================================================================

  const opportunityForm     = document.getElementById('opportunity-form');
  const opportunityIdInput  = document.getElementById('opportunity-id');
  const titleInput          = document.getElementById('title');
  const researchAreaInput   = document.getElementById('research_area');
  const facultyNameInput    = document.getElementById('faculty_name');
  const departmentInput     = document.getElementById('department');
  const positionsInput      = document.getElementById('available_positions');
  const deadlineInput       = document.getElementById('application_deadline');
  const statusSelect        = document.getElementById('status');
  const skillsInput         = document.getElementById('required_skills');
  const descriptionInput    = document.getElementById('description');

  const formTitle           = document.getElementById('form-title');
  const formDescription     = document.getElementById('form-description');
  const submitBtn           = document.getElementById('submit-btn');
  const cancelEditBtn       = document.getElementById('cancel-edit-btn');

  const opportunitiesList   = document.getElementById('opportunities-list');
  const refreshBtn          = document.getElementById('refresh-btn');

  const detailsModal            = document.getElementById('details-modal');
  const closeDetailsBtn         = document.getElementById('close-details-btn');
  const detailsDismissBtn       = document.getElementById('details-dismiss-btn');
  const detailsToggleStatusBtn  = document.getElementById('details-toggle-status-btn');
  const detailsDeleteBtn        = document.getElementById('details-delete-btn');
  const detailsEditBtn          = document.getElementById('details-edit-btn');

  const detailsTitle        = document.getElementById('details-title');
  const detailsStatus       = document.getElementById('details-status');
  const detailsId           = document.getElementById('details-id');
  const detailsFaculty      = document.getElementById('details-faculty');
  const detailsDepartment   = document.getElementById('details-department');
  const detailsArea         = document.getElementById('details-area');
  const detailsPositions    = document.getElementById('details-positions');
  const detailsDeadline     = document.getElementById('details-deadline');
  const detailsSkills       = document.getElementById('details-skills');
  const detailsDescription  = document.getElementById('details-description');

  const globalAlert         = document.getElementById('global-alert');
  const alertIcon           = document.getElementById('alert-icon');
  const alertMessage        = document.getElementById('alert-message');

  const confirmOverlay      = document.getElementById('confirm-overlay');
  const confirmDeleteBtn    = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn     = document.getElementById('cancel-delete-btn');

  // ================================================================
  // 3. STATE
  // ================================================================

  let currentOpportunityId     = null;
  let currentOpportunityStatus = null;
  let alertTimer               = null;

  // ================================================================
  // 4. UTILITY FUNCTIONS
  // ================================================================

  function showAlert(message, type = 'success') {
    if (alertTimer) clearTimeout(alertTimer);
    globalAlert.className    = `alert alert-${type}`;
    alertIcon.textContent    = type === 'success' ? '✓' : '✗';
    alertMessage.textContent = message;
    globalAlert.classList.remove('hidden');
    alertTimer = setTimeout(() => globalAlert.classList.add('hidden'), 4000);
  }

  function hideAlert() {
    globalAlert.classList.add('hidden');
    if (alertTimer) clearTimeout(alertTimer);
  }

  async function extractErrorMessage(response, fallback = 'An unexpected error occurred.') {
    try {
      const body = await response.json();
      if (Array.isArray(body.errors) && body.errors.length > 0) return body.errors.join(' ');
      return body.message || fallback;
    } catch { return fallback; }
  }

  function setSubmitLoading(loading) {
    submitBtn.disabled    = loading;
    submitBtn.textContent = loading
      ? 'Saving…'
      : (opportunityIdInput.value !== '' ? 'Save Changes' : 'Create Opportunity');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ================================================================
  // 5. FORM VALIDATION
  // ================================================================

  function showFieldError(fieldId, message) {
    const field    = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`error-${fieldId}`);
    if (field)    field.classList.add('is-invalid');
    if (errorDiv) errorDiv.textContent = message;
  }

  function clearFieldError(fieldId) {
    const field    = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`error-${fieldId}`);
    if (field)    field.classList.remove('is-invalid');
    if (errorDiv) errorDiv.textContent = '';
  }

  function clearAllFieldErrors() {
    ['title','research_area','faculty_name','department',
     'available_positions','application_deadline','status',
     'required_skills','description'].forEach(clearFieldError);
  }

  function validateForm() {
    clearAllFieldErrors();
    let valid = true;
    if (!titleInput.value.trim())         { showFieldError('title', 'Research title is required.'); valid = false; }
    if (!researchAreaInput.value.trim())  { showFieldError('research_area', 'Research area is required.'); valid = false; }
    if (!facultyNameInput.value.trim())   { showFieldError('faculty_name', "Faculty member's name is required."); valid = false; }
    if (!departmentInput.value.trim())    { showFieldError('department', 'Department is required.'); valid = false; }
    const pos = Number(positionsInput.value);
    if (!positionsInput.value.trim())     { showFieldError('available_positions', 'Number of available positions is required.'); valid = false; }
    else if (!Number.isInteger(pos) || pos < 1) { showFieldError('available_positions', 'Must be a positive whole number.'); valid = false; }
    if (!deadlineInput.value)             { showFieldError('application_deadline', 'Application deadline is required.'); valid = false; }
    if (!['Open','Closed'].includes(statusSelect.value)) { showFieldError('status', 'Status must be Open or Closed.'); valid = false; }
    if (!skillsInput.value.trim())        { showFieldError('required_skills', 'Required skills are required.'); valid = false; }
    if (!descriptionInput.value.trim())   { showFieldError('description', 'Research description is required.'); valid = false; }
    return valid;
  }

  [titleInput, researchAreaInput, facultyNameInput, departmentInput,
   positionsInput, deadlineInput, statusSelect, skillsInput, descriptionInput
  ].forEach((field) => {
    field.addEventListener('input',  () => clearFieldError(field.name || field.id));
    field.addEventListener('change', () => clearFieldError(field.name || field.id));
  });

  // ================================================================
  // 6. CARD RENDERING
  // ================================================================

  function renderCard(opportunity) {
    const isOpen    = opportunity.status === 'Open';
    const badgeClass = isOpen ? 'status-open' : 'status-closed';
    return `
      <div class="opportunity-card">
        <div class="card-top">
          <span class="status-badge ${badgeClass}">${opportunity.status}</span>
        </div>
        <h3 class="card-title">${escapeHtml(opportunity.title)}</h3>
        <p class="card-faculty">${escapeHtml(opportunity.faculty_name)}</p>
        <p class="card-department">${escapeHtml(opportunity.department)}</p>
        <div class="card-meta">
          <span>📍 ${escapeHtml(opportunity.research_area)}</span>
          <span>👥 ${opportunity.available_positions} position(s)</span>
          <span>📅 Deadline: ${opportunity.application_deadline}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" data-action="view" data-id="${opportunity.id}">
            View Details
          </button>
        </div>
      </div>`;
  }

  function renderOpportunityList(opportunities) {
    if (opportunities.length === 0) {
      opportunitiesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No Research Opportunities Found</h3>
          <p>Use the form above to post the first research opening.</p>
        </div>`;
      return;
    }
    opportunitiesList.innerHTML = opportunities.map(renderCard).join('');
  }

  // ================================================================
  // 7. MODAL HELPERS
  // ================================================================

  function openModal() {
    detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    detailsModal.classList.add('hidden');
    document.body.style.overflow  = '';
    currentOpportunityId          = null;
    currentOpportunityStatus      = null;
  }

  function openConfirmDialog()  { confirmOverlay.classList.remove('hidden'); }
  function closeConfirmDialog() { confirmOverlay.classList.add('hidden'); }

  function populateDetailsModal(opportunity) {
    detailsTitle.textContent       = opportunity.title;
    detailsId.textContent          = `#${opportunity.id}`;
    detailsFaculty.textContent     = opportunity.faculty_name;
    detailsDepartment.textContent  = opportunity.department;
    detailsArea.textContent        = opportunity.research_area;
    detailsPositions.textContent   = opportunity.available_positions;
    detailsDeadline.textContent    = opportunity.application_deadline;
    detailsSkills.textContent      = opportunity.required_skills;
    detailsDescription.textContent = opportunity.description;
    const isOpen = opportunity.status === 'Open';
    detailsStatus.textContent = opportunity.status;
    detailsStatus.className   = `status-badge ${isOpen ? 'status-open' : 'status-closed'}`;
    detailsToggleStatusBtn.textContent = isOpen ? 'Mark as Closed' : 'Mark as Open';
    currentOpportunityId     = opportunity.id;
    currentOpportunityStatus = opportunity.status;
  }

  // ================================================================
  // 8. FORM MODE HELPERS
  // ================================================================

  function switchToCreateMode() {
    formTitle.textContent        = 'Post New Research Opportunity';
    formDescription.textContent  = 'Fill out the form below to create a research opening';
    submitBtn.textContent        = 'Create Opportunity';
    submitBtn.disabled           = false;
    cancelEditBtn.classList.add('hidden');
    opportunityIdInput.value     = '';
    opportunityForm.reset();
    clearAllFieldErrors();
    hideAlert();
  }

  function switchToEditMode(opportunity) {
    formTitle.textContent        = 'Update Research Opportunity';
    formDescription.textContent  = `Editing Opportunity ID: ${opportunity.id}`;
    submitBtn.textContent        = 'Save Changes';
    submitBtn.disabled           = false;
    cancelEditBtn.classList.remove('hidden');
    opportunityIdInput.value      = opportunity.id;
    titleInput.value              = opportunity.title                || '';
    researchAreaInput.value       = opportunity.research_area        || '';
    facultyNameInput.value        = opportunity.faculty_name         || '';
    departmentInput.value         = opportunity.department           || '';
    positionsInput.value          = opportunity.available_positions  || '';
    deadlineInput.value           = opportunity.application_deadline || '';
    statusSelect.value            = opportunity.status               || 'Open';
    skillsInput.value             = opportunity.required_skills      || '';
    descriptionInput.value        = opportunity.description          || '';
    clearAllFieldErrors();
    hideAlert();
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  }

  // ================================================================
  // 9. API — GET ALL OPPORTUNITIES
  // ================================================================

  async function loadOpportunities() {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to load opportunities.');
        showAlert(msg, 'error');
        return;
      }
      const body = await response.json();
      renderOpportunityList(body.data);
    } catch (error) {
      console.error('Network error loading opportunities:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    }
  }

  // ================================================================
  // 10. PLACEHOLDER STUBS (filled in subsequent commits)
  // ================================================================

  /**
   * loadOpportunityById — GET /api/opportunities/:id
   * Fetches one record from the database and opens the details modal.
   */
  async function loadOpportunityById(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (response.status === 404) {
        showAlert('Opportunity not found. It may have been deleted.', 'error');
        return;
      }
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to load opportunity details.');
        showAlert(msg, 'error');
        return;
      }
      const body = await response.json();
      populateDetailsModal(body.data);
      openModal();
    } catch (error) {
      console.error('Network error loading opportunity:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    }
  }

  /**
   * createOpportunity — POST /api/opportunities
   * Sends all form fields as JSON. On success, resets form and refreshes list.
   */
  async function createOpportunity() {
    const payload = {
      title:                titleInput.value.trim(),
      research_area:        researchAreaInput.value.trim(),
      faculty_name:         facultyNameInput.value.trim(),
      department:           departmentInput.value.trim(),
      available_positions:  Number(positionsInput.value),
      application_deadline: deadlineInput.value,
      status:               statusSelect.value,
      required_skills:      skillsInput.value.trim(),
      description:          descriptionInput.value.trim()
    };
    try {
      setSubmitLoading(true);
      const response = await fetch(API_BASE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      if (response.status === 400) {
        const msg = await extractErrorMessage(response, 'Invalid data submitted.');
        showAlert(`Validation error: ${msg}`, 'error');
        return;
      }
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to create opportunity.');
        showAlert(msg, 'error');
        return;
      }
      const body = await response.json();
      switchToCreateMode();
      showAlert(`Research opportunity "${body.data.title}" created successfully!`, 'success');
      await loadOpportunities();
    } catch (error) {
      console.error('Network error creating opportunity:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    } finally {
      setSubmitLoading(false);
    }
  }

  /**
   * updateOpportunity — PUT /api/opportunities/:id
   * Sends all form fields. Backend supports partial update so this is safe.
   * On success: resets to create mode and refreshes the list.
   */
  async function updateOpportunity(id) {
    const payload = {
      title:                titleInput.value.trim(),
      research_area:        researchAreaInput.value.trim(),
      faculty_name:         facultyNameInput.value.trim(),
      department:           departmentInput.value.trim(),
      available_positions:  Number(positionsInput.value),
      application_deadline: deadlineInput.value,
      status:               statusSelect.value,
      required_skills:      skillsInput.value.trim(),
      description:          descriptionInput.value.trim()
    };
    try {
      setSubmitLoading(true);
      const response = await fetch(`${API_BASE}/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      if (response.status === 400) {
        const msg = await extractErrorMessage(response, 'Invalid data submitted.');
        showAlert(`Validation error: ${msg}`, 'error');
        return;
      }
      if (response.status === 404) {
        showAlert('Opportunity not found. It may have been deleted.', 'error');
        switchToCreateMode();
        return;
      }
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to update opportunity.');
        showAlert(msg, 'error');
        return;
      }
      const body = await response.json();
      switchToCreateMode();
      showAlert(`Opportunity "${body.data.title}" updated successfully!`, 'success');
      await loadOpportunities();
    } catch (error) {
      console.error('Network error updating opportunity:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    } finally {
      setSubmitLoading(false);
    }
  }

  /**
   * toggleStatus — PUT /api/opportunities/:id  { status: "Closed" | "Open" }
   * Sends ONLY the status field — the backend accepts partial updates.
   * This is what the "Mark as Closed" / "Mark as Open" button calls.
   */
  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus })
      });
      if (response.status === 404) {
        showAlert('Opportunity not found. It may have been deleted.', 'error');
        closeModal();
        await loadOpportunities();
        return;
      }
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to update status.');
        showAlert(msg, 'error');
        return;
      }
      closeModal();
      showAlert(`Status changed to "${newStatus}".`, 'success');
      await loadOpportunities();
    } catch (error) {
      console.error('Network error toggling status:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    }
  }

  /**
   * deleteOpportunity — DELETE /api/opportunities/:id
   * Permanently removes the record from MySQL.
   * On success: shows message, closes modal, refreshes list.
   */
  async function deleteOpportunity(id) {
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (response.status === 404) {
        showAlert('Opportunity not found. It may have already been deleted.', 'error');
        closeModal();
        await loadOpportunities();
        return;
      }
      if (!response.ok) {
        const msg = await extractErrorMessage(response, 'Failed to delete opportunity.');
        showAlert(msg, 'error');
        return;
      }
      closeModal();
      showAlert(`Opportunity #${id} has been permanently deleted.`, 'success');
      await loadOpportunities();
    } catch (error) {
      console.error('Network error deleting opportunity:', error);
      showAlert('Could not connect to the server. Is the backend running?', 'error');
    }
  }

  // ================================================================
  // 11. EVENT HANDLERS
  // ================================================================

  opportunityForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    if (opportunityIdInput.value !== '') { await updateOpportunity(opportunityIdInput.value); }
    else { await createOpportunity(); }
  });

  cancelEditBtn.addEventListener('click', () => switchToCreateMode());

  refreshBtn.addEventListener('click', async () => await loadOpportunities());

  closeDetailsBtn.addEventListener('click', closeModal);
  detailsDismissBtn.addEventListener('click', closeModal);
  detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeModal(); });

  detailsToggleStatusBtn.addEventListener('click', async () => {
    if (!currentOpportunityId) return;
    await toggleStatus(currentOpportunityId, currentOpportunityStatus);
  });

  detailsEditBtn.addEventListener('click', async () => {
    if (!currentOpportunityId) return;
    const id = currentOpportunityId;
    closeModal();
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      if (!response.ok) { showAlert('Failed to load opportunity for editing.', 'error'); return; }
      const body = await response.json();
      switchToEditMode(body.data);
    } catch { showAlert('Could not connect to the server.', 'error'); }
  });

  detailsDeleteBtn.addEventListener('click', () => openConfirmDialog());

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!currentOpportunityId) return;
    const id = currentOpportunityId;
    closeConfirmDialog();
    await deleteOpportunity(id);
  });

  cancelDeleteBtn.addEventListener('click', () => closeConfirmDialog());

  opportunitiesList.addEventListener('click', async (event) => {
    const viewBtn = event.target.closest('[data-action="view"]');
    if (!viewBtn) return;
    await loadOpportunityById(viewBtn.dataset.id);
  });

  // ================================================================
  // 12. INITIALISATION
  // ================================================================

  switchToCreateMode();
  loadOpportunities();   // Fetch all opportunities from the database on page load

  console.log('%cPortal — Commit 1: List API connected', 'color:#0d3b66;font-weight:bold;');

});
