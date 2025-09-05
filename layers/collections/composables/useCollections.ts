import { z } from "zod";
export default function () {
  const posts = useState('posts', () =>[])

  // This is for the dynamic loading of the component in Crud/components/DynamicFormLoader
  const componentMap = {
    posts: 'PostsForm',
  }

  return {
    posts,
    componentMap
  }
}
