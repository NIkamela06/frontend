let freelancers = [];

function showFeaturedFreelancers() {
  const featuredDiv = document.getElementById('featuredFreelancersList');
  if (!featuredDiv) return;
  featuredDiv.innerHTML = '';

  if (freelancers.length === 0) {
    featuredDiv.innerHTML = 'No featured freelancers yet.';
    return;
  }

  freelancers.forEach(function(freelancer) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<h3>' + freelancer.username + '</h3>' +
      '<p>Email: ' + freelancer.email + '</p>' +
      '<p>Skills: ' + freelancer.skills.join(', ') + '</p>' +
      '<button onclick="showFreelancerProfile(\'' + freelancer.username + '\')">View Profile</button>';
    featuredDiv.appendChild(card);
  });
}

function fetchAndDisplayFreelancers() {
  fetch('http://localhost:3000/freelancers')
    .then(function(response) {
      return response.json();
    })
    .then(function(fetchedFreelancers) {
      freelancers = fetchedFreelancers;
      showFreelancerList(freelancers);
      showFeaturedFreelancers();
    });
}

function showFreelancerList(list) {
  const resultDiv = document.getElementById('freelancerResults');
  resultDiv.innerHTML = '';

  if (list.length === 0) {
    resultDiv.innerHTML = 'No freelancers found.';
    return;
  }

  list.forEach(function(freelancer) {
    const div = document.createElement('div');
    div.innerHTML =
      '<a href="#" onclick="showFreelancerProfile(\'' + freelancer.username + '\')">' + freelancer.username + '</a> - Skills: ' + freelancer.skills.join(', ') +
      ' <button onclick="removeFreelancer(\'' + freelancer._id + '\')">Delete</button>' +
      ' <button onclick="editFreelancer(\'' + freelancer._id + '\')">Update</button>';
    resultDiv.appendChild(div);
  });
}

function searchFreelancers() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const filteredFreelancers = freelancers.filter(function(freelancer) {
    return freelancer.skills.some(function(skill) {
      return skill.toLowerCase().includes(searchInput);
    });
  });
  showFreelancerList(filteredFreelancers);
}

window.onload = fetchAndDisplayFreelancers;

const registerForm = document.getElementById('register');
if (registerForm) {
  registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const skills = document.getElementById('skills').value.split(',').map(function(skill) { return skill.trim(); });
    const password = document.getElementById('password').value;
    const roleSelect = document.getElementById('role');
    let role = 'freelancer';
    if (roleSelect) {
      role = roleSelect.value;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      alert('Password must be at least 8 characters long, include an uppercase letter, and a number.');
      return;
    }

    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        email: email,
        skills: skills,
        password: password,
        role: role
      })
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(errorData) {
          throw new Error(errorData.error || 'Registration failed');
        });
      }
      return response.json();
    })
    .then(function() {
      alert('Registration successful!');
      window.location.href = 'login.html';
    })
    .catch(function(error) {
      alert('Registration error: ' + error.message);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm2 = document.getElementById('loginForm');
  if (!loginForm2) return;

  loginForm2.onsubmit = async function(event) {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // Always parse JSON, but handle possible invalid JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        // Show error from backend or generic message
        alert(data.error || 'Login failed. Please try again.');
        return;
      }

      // Only redirect if login is successful and user is freelancer
      if (data.userType === 'freelancer' && data.freelancer && data.freelancer._id) {
        localStorage.setItem('freelancerId', data.freelancer._id);
        window.location.href = 'frontend-freelnprofl/profile.html';
      } else if (data.userType === 'employer') {
        window.location.href = '/employer-side/frontend-main/index.html';
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };
});

if (window.location.pathname.endsWith('login.html')) {
  window.addEventListener('DOMContentLoaded', fetchAndDisplayFreelancers);
}

function removeFreelancer(id) {
  fetch('http://localhost:3000/freelancers/' + id, {
    method: 'DELETE'
  })
  .then(function(response) {
    if (!response.ok) throw new Error('Delete failed');
    alert('Freelancer has been removed.');
    fetchAndDisplayFreelancers();
  })
  .catch(function(error) {
    alert('Delete error: ' + error.message);
  });
}

function editFreelancer(id) {
  const freelancer = freelancers.find(function(f) { return f._id === id; });
  if (!freelancer) return;

  const newUsername = prompt('Update username:', freelancer.username);
  if (newUsername === null) return;
  const newEmail = prompt('Update email:', freelancer.email);
  if (newEmail === null) return;
  const newSkills = prompt('Update skills (comma separated):', freelancer.skills.join(', '));
  if (newSkills === null) return;

  fetch('http://localhost:3000/freelancers/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: newUsername,
      email: newEmail,
      skills: newSkills.split(',').map(function(skill) { return skill.trim(); })
    })
  })
  .then(function(response) {
    if (!response.ok) throw new Error('Update failed');
    alert('Freelancer information updated.');
    fetchAndDisplayFreelancers();
  })
  .catch(function(error) {
    alert('Update error: ' + error.message);
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    
    if (name && email && message) {
      alert('Thank you, ' + name + '! Your message has been sent. We will get back to you at ' + email + '.');
    }
    contactForm.reset();
  
  });
}

function closeFreelancerProfile() {
  const profileDiv = document.getElementById('freelancerProfile');
  profileDiv.style.display = 'none';
  profileDiv.innerHTML = '';
}
function showFreelancerProfile(username) {
  const freelancer = freelancers.find(function(f) { return f.username === username; });
  if (!freelancer) return;

  const profileDiv = document.getElementById('freelancerProfile');
  profileDiv.innerHTML =
    '<h3>' + freelancer.username + '</h3>' +
    '<p>Email: ' + freelancer.email + '</p>' +
    '<p>Skills: ' + freelancer.skills.join(', ') + '</p>' +
    '<button onclick="closeFreelancerProfile()">Close Profile</button>';
  profileDiv.style.display = 'block';
}
  profileDiv.style.display = 'block';


  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;

  if (name && email && message) {
    alert('Thank you, ' + name + '! Your message has been sent. We will get back to you at ' + email + '.');
  }
  contactForm.reset();
