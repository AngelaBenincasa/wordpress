import placeholdersMixin from '../../../js/backend/mixins/placeholdersMixin'

export default {
  mixins: [placeholdersMixin],

  data () {
    return {
      editorOptions: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'script': 'sub'}, {'script': 'super'}],
            [{'indent': '-1'}, {'indent': '+1'}],
            [{'direction': 'rtl'}],
            [{'size': ['small', false, 'large', 'huge']}],
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'font': []}],
            [{'color': []}, {'background': []}],
            [{'align': []}],
            ['clean'],
            ['link', 'image']
          ]
        }
      },
      pageUrl: ''
    }
  },

  methods: {
    parseQuillEditorContent (object) {
      let elements = object.quill.root.getElementsByTagName('p')

      for (let i = 0; i < elements.length; i++) {
        for (let key in this.linksForParsing) {
          let links = elements[i].getElementsByTagName('a')

          for (let j = 0; j < links.length; j++) {
            if (links[j].href === this.pageUrl + key) {
              links[j].href = key
            }
          }

          if (elements[i].textContent.indexOf(this.linksForParsing[key]) !== -1) {
            elements[i].innerHTML = elements[i].innerHTML.replace(this.plainTextLinksForParsing[key], this.linksForParsing[key])
          }
        }
      }
    }
  }
}
