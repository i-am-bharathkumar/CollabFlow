// animations.js
// Add this file to your utils directory

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    
    // Function to check if an element is in viewport
    const isInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
      );
    };
    
    // Function to handle animation based on visibility
    const handleAnimation = () => {
      animatedElements.forEach(el => {
        if (isInViewport(el)) {
          // Check if element already has active class
          if (!el.classList.contains('active')) {
            el.classList.add('active');
          }
        }
      });
    };
    
    // Initial check for elements in viewport
    handleAnimation();
    
    // Check on scroll
    window.addEventListener('scroll', () => {
      handleAnimation();
    });
    
    // Check on resize
    window.addEventListener('resize', () => {
      handleAnimation();
    });
    
    // Initialize count-up animation for statistics
    const countUpElements = document.querySelectorAll('.count-up');
    
    countUpElements.forEach(element => {
      const finalValue = element.textContent;
      let startValue = 0;
      
      // Extract numeric part if there's a '+' sign or other characters
      const numericValue = parseInt(finalValue.replace(/\D/g, ''));
      
      // Get duration based on the size of the number
      const duration = Math.min(2000, numericValue / 10);
      
      // Calculate increment
      const increment = numericValue / (duration / 20);
      
      // Start counter
      const counter = setInterval(() => {
        startValue += increment;
        
        // Format the number with commas
        const formattedValue = Math.floor(startValue).toLocaleString();
        
        // Add back any non-numeric characters (like '+')
        element.textContent = finalValue.includes('+') ? 
          `${formattedValue}+` : formattedValue;
        
        if (startValue >= numericValue) {
          element.textContent = finalValue;
          clearInterval(counter);
        }
      }, 20);
    });
  });
  
  // You can also implement Intersection Observer for more efficient animations
  const setupIntersectionObserver = () => {
    if ('IntersectionObserver' in window) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, options);
      
      const elements = document.querySelectorAll('.fade-in, .slide-up');
      elements.forEach(element => {
        observer.observe(element);
      });
    }
  };
  
  // Call this function after DOM is loaded to implement Intersection Observer
  document.addEventListener('DOMContentLoaded', setupIntersectionObserver);
  
  export default setupIntersectionObserver;