const freelancerId = localStorage.getItem('freelancerId');
const apiBaseUrl = 'http://localhost:3000/freelancers';

const profileViewDiv = document.getElementById('profileView');
const profileEditDiv = document.getElementById('profileEdit');
const editButton = document.getElementById('editBtn');
const editProfileForm = document.getElementById('editProfileForm');

let currentFreelancer = null;

function loadFreelancerProfile() {
  if (!freelancerId) {
    alert('No freelancer logged in.');
    window.location.href = '../../employer-side/frontend-main/login.html';
    return;
  }
  fetch(apiBaseUrl + '/' + freelancerId)
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    })
    .then(function(freelancer) {
      currentFreelancer = freelancer;
      showProfileView(freelancer);
    })
    .catch(function(error) {
      alert('Error loading profile: ' + error.message);
    });
}

function showProfileView(freelancer) {
  profileViewDiv.innerHTML =
    '<p><strong>Username:</strong> ' + freelancer.username + '</p>' +
    '<p><strong>Email:</strong> ' + freelancer.email + '</p>' +
    '<p><strong>Skills:</strong> ' + freelancer.skills.join(', ') + '</p>';
  profileViewDiv.style.display = 'block';
  profileEditDiv.style.display = 'none';
  editButton.style.display = 'inline-block';
}

function showEditProfileForm() {
  if (!currentFreelancer) return;
  document.getElementById('editUsername').value = currentFreelancer.username;
  document.getElementById('editEmail').value = currentFreelancer.email;
  document.getElementById('editSkills').value = currentFreelancer.skills.join(', ');
  profileViewDiv.style.display = 'none';
  profileEditDiv.style.display = 'block';
  editButton.style.display = 'none';
}

function cancelEditProfile() {
  showProfileView(currentFreelancer);
}

editProfileForm.onsubmit = function(event) {
  event.preventDefault();
  const username = document.getElementById('editUsername').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const skills = document.getElementById('editSkills').value.split(',').map(function(skill) { return skill.trim(); });

  fetch(apiBaseUrl + '/' + freelancerId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, email: email, skills: skills })
  })
  .then(async function(response) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }
    return response.json();
  })
  .then(function(updatedFreelancer) {
    currentFreelancer = updatedFreelancer;
    showProfileView(updatedFreelancer);
    alert('Profile updated successfully!');
  })
  .catch(function(error) {
    alert('Update error: ' + error.message);
  });
};


editButton.onclick = showEditProfileForm;


window.onload = loadFreelancerProfile;


window.cancelEdit = cancelEditProfile;
