      var activeIdentifier = null
      function gaptextClick(e) {
        if (e.target.classList.contains('deactive')) return;
        activeIdentifier = e.target.getAttribute("identifier")
        for (var i = 0; i < gaps.length; i++) {
          gaps[i].classList.add("canfill")
        }
        e.target.classList.add('active')
        activeIdentifier = e.target.getAttribute('identifier')
        for (var i = 0; i < gaptexts.length; i++) {
          if (gaptexts[i] === e.target || gaptexts[i].classList.contains("used")) continue
          gaptexts[i].classList.remove('active')
        }
        //console.log("gaptext", e.target)
      }
      function gapClick(e) {
        if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
        if (e.target.classList.contains('filled')) {
          var gaptextIdentifier = e.target.getAttribute('gaptextIdentifier')
          gapmap[gaptextIdentifier].classList.remove('deactive')
          if (!activeIdentifier) {
            e.target.classList.remove('filled')
            e.target.removeAttribute('gaptextIdentifier')
            e.target.innerHTML = "\u00a0"
          }
        }
        if (activeIdentifier) {
          e.target.childNodes[0].nodeValue = gapmap[activeIdentifier].childNodes[0].nodeValue
          e.target.setAttribute('gaptextIdentifier', activeIdentifier)
          e.target.classList.add('filled')
          gapmap[activeIdentifier].classList.add('deactive')
        }
        activeIdentifier = null
        for (var i = 0; i < gaps.length; i++) gaps[i].classList.remove('canfill')
        for (var i = 0; i < gaptexts.length; i++) gaptexts[i].classList.remove('active')
      }

      var gaptextElements = document.getElementsByTagName('li')
      console.log('gaptextElements',gaptextElements.length)
      var gaptexts = []
      var activeIdentifier = null
      function gaptextClick(e) {
        if (e.target.classList.contains('deactive')) return;
        activeIdentifier = e.target.getAttribute("identifier")
        for (var i = 0; i < gaps.length; i++) {
          gaps[i].classList.add("canfill")
        }
        e.target.classList.add('active')
        activeIdentifier = e.target.getAttribute('identifier')
        for (var i = 0; i < gaptexts.length; i++) {
          if (gaptexts[i] === e.target || gaptexts[i].classList.contains("used")) continue
          gaptexts[i].classList.remove('active')
        }
        //console.log("gaptext", e.target)
      }
      function gapClick(e) {
        if (!e.target.classList.contains('canfill') && !e.target.classList.contains('filled')) return
        if (e.target.classList.contains('filled')) {
          var gaptextIdentifier = e.target.getAttribute('gaptextIdentifier')
          gapmap[gaptextIdentifier].classList.remove('deactive')
          if (!activeIdentifier) {
            e.target.classList.remove('filled')
            e.target.removeAttribute('gaptextIdentifier')
            e.target.innerHTML = "\u00a0"
          }
        }
        if (activeIdentifier) {
          console.log(e.target)
          console.log(e.target.innerHTML)
          console.log(gapmap[activeIdentifier].innerHTML)
          e.target.childNodes[0].nodeValue = gapmap[activeIdentifier].childNodes[0].nodeValue
          e.target.setAttribute('gaptextIdentifier', activeIdentifier)
          e.target.classList.add('filled')
          gapmap[activeIdentifier].classList.add('deactive')
        }
        activeIdentifier = null
        for (var i = 0; i < gaps.length; i++) gaps[i].classList.remove('canfill')
        for (var i = 0; i < gaptexts.length; i++) gaptexts[i].classList.remove('active')
      }
      var gapmap = {}
      for (var i = 0; i < gaptextElements.length; i++) {
        console.log(i,gaptextElements[i].classList)
        if (gaptextElements[i].classList.contains("gapText")) {
          gaptextElements[i].addEventListener("click", gaptextClick)
          gaptexts.push(gaptextElements[i])
          gapmap[gaptextElements[i].getAttribute('identifier')] = gaptextElements[i]
        }
      }
      console.log('gaptexts',gaptexts)
      var gapElements = document.getElementsByTagName('span')
      console.log('gapElements',gapElements.length)
      var gaps = []
      for (var i = 0; i < gapElements.length; i++) {
        console.log(gapElements[i].classList)
        if (gapElements[i].classList.contains("gap")) {
          gapElements[i].addEventListener("click", gapClick)
          gaps.push(gapElements[i])
        }
      }
      console.log('gaps',gaps)
      console.log('gaptexts',gaptexts)
