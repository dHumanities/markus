# Comparativus Algorithm
In this file I will try to explain the comparison algorithm used in *Comparativus* in detail following the comparison process step by step. But before we begin I would like to include a bit of history of *Comparativus* and its *raison d'être*. 

## 1. Comparativus History
In december 2016 I started working on a comparison module for the already succesful online text editing and annotating environment *MARKUS*. The initial development stage was mostly plagued by unfamiliarity with cross-browser compatability and methods used for text comparison. This stage took roughly the first half year and was mostly filled with experimentation with different algorithms and Javascript technologies. The real breakthrough came when in the first half of 2017 a brief but fruitful discussion with Dr. P. Vierthaler about his current work on large scale text comparison provided me with the basics of the algorithm currently used in *Comparativus*. 

In the summer of 2017 I was sent to Washington to cooperate on the [Homer Multitext](http://www.homermultitext.org) project where I discussed the problems I was still facing with their two main data architects, Dr. N. Smith and Dr. C. Blackwell. They gave me a basic understanding of their usage of URNs to mark a text location which made me develop the current simplified approach used in *Comparativus*.

In the fall and early spring of 2018 most of the final touches were made, bugs were squashed, and user feedback was implemented which led to the first public release of *Comparativus*. In this article I will discuss the state of the algorithm as of April 2018. Although *Comparativus* still lacks many of the features we want I'm positive the algorithm will remain mostly unchanged. Before we dive straight into an outline of the algorithm let's briefly discussed the (short) list of technology used in development of *Comparativus*.

## 2. Comparativus Technology
One of the demands of developing a *MARKUS* expansion was the need for it to be mostly client side. All of the code for *Comparativus* is writting in Javascript using some of the most recent technological advancements in the field such as Web Workers. This restriction on the code to run client side placed **major** restrictions on the complexity of the code and size of the texts compared. The use of external libraries and dependencies has been minimized as much as possible. Currently we're only using the following libraries:
- [JQuery](https://jquery.com/) (v. 3.1.1 as of April 2018) for DOM manipulation.
- [D3](https://d3js.org/) (v. 4.8.0 as of April 2018) for result visualisation.

## 3. Algorithm Outline
Below you can see a list of all the steps the algorithm takes to complete a comparison between two texts as well as a reference to the chapter in which we discuss this specific step. Before this algorithm runs I assume the texts have already been loaded by whatever API suits the needs of the user. In the case of *Comparativus* there are multiple ways of providing a text for comparison which are not at all related to the algorithm used. In the end the algorithm is provided with two texts stored as strings in Javascript.

1. Preparation. [Chapter 4](#4-preparation)
 1. Prepare every text for comparison. [Chapter 4.1](#4-1-text-preparation)
 1. Create a *dictionary* object for every text. [Chapter 4.2](#4-2-dictionary-creation)
2. Comparison. [Chapter 5](#5-comparison)
 1. Determine overlapping seeds in *dictionaries*. [Chapter 5.1](#5-1-overlapping-seeds)
 1. For every overlapping seed, try to expand it. [Chapter 5.2](#5-2-seed-expansion)
3. Processing. [Chapter 6][#6-processing]
 1. Merge overlapping matches. [Chapter 6.1](#6-1-overlap-merging)
 1. Visualise the results. [Chapter 6.2](#6-2-result-visualisation)

I will try to skip as much *Comparitivus*-specific implementations as possible, such as the insertion of HTML-elements whilst still keeping characterindex numbers correct, but where it becomes relevant I will briefly describe how this specific process is implemented in *Comparativus*. The source code is available on [Github](https://www.github.com/MGelein/comparativus).

## 4. Preparation
Before any sort of comparison process can be started on the two provided texts, they need to be thoroughly cleaned and indexed for the comparison algorithm. The loading process of the texts is not relevant for our discussion about the algorithm. The texts are supplied as either plain text or as a tagged HTML text from MARKUS.

### 4.1. Text Preparation
The first step in text preparation is to remove any HTML tags. These tags could form too much noise in a comparison algorithm and are, naturally, not relevant for most comparisons. Stripping the tags is done using an invisible HTML element that is filled with the loaded text. Then we use JQuery to load only the text from that element. Both the original loaded data and the cleaned plain text data is stored.

The next step is to remove any other characters that could interfer with the comparison process. Most notably these characters are any form of whitespace and punctuation. This is where one of the first fundamental differences with Dr. Vierthaler's becomes clear. In his algorithm these characters can just be removed. In the case of *Comparativus* however we need to be able to visualise the matches we find, meaning we can't just remove characters without keeping track of their original location. The solution is inspired by the URNs used by the homermultitext project. 

Instead of keeping track of index numbers in a text, which is a traditional way of keeping track of location in a string, we keep track of which character was the preceding character. For example, let's say want to remove the space in the following phrase: 'Hello World'.

We would remove the space and then mark it as being removed after the first 'o', or `o[0]`. This notation allows us to remove characters while keeping track of their location without having to account for the change of length that is caused by the act of removing. This whole process is done on a separate Javascript Web Worker, basically a thread, to prevent the main GUI thread from hanging. When this is done, the texts are ready for the next step of the comparison: the creation of a 'dictionary'. 

### 4.2. Dictionary Creation
The dictionary is ofcourse a Python datatype. Since I'm writing in Javascript I don't have access to that specific datatype, but the Object datatype in Javascript is similar enough to work functionally the same. The text is sent to a Web Worker once again, where it will be turned into a dictionary object that will be sent back to be stored globally. 

This process can be summarized as going through the string, indexing every n-gram of seedlength K, a preset variable. Every n-gram is checked to see if this n-gram already exists. If it is already a key in the object, the index at which this n-gram has been found is added to the list of indeces for that n-gram. If the n-gram is not yet a key for the dictionary object, we make it a key with as its value the index at which this n-gram has been found. As an example, I'll show you the result of the following word:
```
Catbat
```
If we ignore the random nature of this word for a second, the algorithm will turn it into the following Javascript Object, if we use K=2 as seed size:
```
{
    "ca": [0],
    "at": [1, 4],
    "tb": [2],
    "ba": [3],
}
```
The effect of the seed size, K, on the algorithm and mostly the speed of the execution of the algorithm, is large. Smaller seedsizes mean that we have more seeds, resulting in larger dictionaries, more identical seeds and in the comparison more overlapping seeds. All of this means that the algorithm used with a smaller seed size is significantly slower to execute. So far, for Chinese texts, I've found a size of K=4 to work quite well. For european languages we can assume the seedsize could be larger, since the semantic value of four characters in chinese is larger than the value of four characters in for example English.

This process creates a 'dictionary' that holds the index or indeces for every n-gram in one of the texts. The created object is then passed back to the main process. Now we're ready for the user to start a comparison. The next step in the algorithm is triggered by user input.

## 5. Comparison
Once the user has submitted all texts for comparison and all these texts have been prepared for comparison as described above, we can start the actual comparison process. This process can involve more than two texts, but in that case it will still boil down two multiple one on one comparisons. For example: If we compare text A, B, and C we process the following comparisons: A with B, A with C, and B with C. This means that the basic process remains unchanged, therefore I'll only discuss a basic comparison of two texts. Let's call them, unimaginatively, text A and text B.

### 5.1. Overlapping Seeds
Our first step in the process is determining the overlap in the seeds, or n-grams, found in the dictionaries of both texts. This is done using a double for-loop, as shown below:
```
var ngramsA = Object.keys(dictionaryA);
var ngramsB = Object.keys(dictionaryB);
for(var i = 0; i < ngramsA.length; i++){
    for(var j = 0; j < ngramsB.length; j++){
        if(ngramsA[i] === ngramsB[j]){
            expandMatches(dictionaryA[ngramsA[i]], dictionaryB[ngramsB[j]]);
        }
    }
}
```
We loop through every possible n-gram in both texts and if we find a n-gram that is present in both texts, we pass the occurence indeces of that n-gram through to the `expandMatches` function. This function simple checks to see if a n-gram has multiple occurences, in which case it will try to expand every occurence of the n-gram in text A against every occurence of that same n-gram in text B.

### 5.2. Seed Expansion
The expansion of a match starts with a single n-gram occurence in both text A and text B with their respective indeces. Up untill this point the algorithm has only done exact matching. This is the step where we introduce the 'fuzziness' of the matching algorithm.

In this function we will use an iterative approach to expand the string both to the left and to the right of the matching index. Every time this matchlength increases we grab a new substring from both texts and compare using Levenshtein distance. We then normalize this edit distance using the total matchLength to get a ratio of similarity between the two substrings. For example: The strings 'cat' and 'bat' have a Levenshtein distance of one. Their similarity ratio is this edit distance divided by the matchlength: i.e. one third.

Once we have this similarity ratio we compare it to a pre-set threshold, in the case of *Comparativus* this is `0.8`. If the number is lower than the provided threshold we award one strike, after three strikes we stop trying to expand in that direction and revert the expansion by three characters. If the number is equal or higher than the threshold we set the strikes back to zero and continue our expansion in that direction. 

We try to expand both left and right and continue untill we have built up three consecutive strikes. This is our fully expanded match. For this expanded match we have an index number in text A, an index number in text B, a match length, a ratio of the match. To gain some speed in the browser we then compare the given matchlength agains the minimum matchlength the user has provided in the UI. If a match is shorter than the minimum length, it does not qualify as a valid match. Such an optimization is ofcourse only necessary in a browser environment where you want to give the next processing step as little to do as possible. Once the match is valid its data is all stored in a match object that is pushed into a global matches array. This process is repeated for every n-gram match in the dictionaries provided in the previous step. Once all the seeds have been processed we have the first version of the list of matches between text A and text B. The next step is to process this information.

## 6. Processing
Now that the actual comparison is done we need to filter and process the matches that have been found. This step may take on a different form depending on your requirements for the final product. In a more quantative approach the matches array produced by the last step might be your final result. However, since *Comparativus* has been developed with a non-expert user in mind, we do some further processing.

### 6.1. Overlap Merging
 Usually a lot of overlapping matches have been found due to the way the matching n-grams work. If a match is longer than your initial seed size, K, you are bound to have multiple matching n-grams within one match. In turn this means that after expansion you can have multiple matches that are ideally identical or at least very similar. To prevent this we compare every match against every other match and see if they have overlap using the index numbers and match lengths. If the provided matches have overlap they are merged together and their ratio and matchlength are updated to reflect that change. 

 With the overlap removed from the array we now have the final version of the matches array. Further processing is only done to help the user analyse the results by presenting the data in multiple ways.

### 6.2. Result Visualisation
In *Comparativus* the results of the comparison are presented in three different ways: We present the data in a table, in the text and in a chord-diagram. For every presentation method we need a slightly different way of processing the array of matches. 

The easiest of all three visualisation is the table view. The table is generated simply by creating a separate row in the table for every entry in the array, with the columns corresponding to the fields of a match object. If you look at the actual table in *Comparativus* you will also see some 'URNs' as described in the preparation step. These refer to the location of the match in the text. The reason I'm not simply using index numbers is related to my next visualisation.

For the text visualisation we have one fundamental problem. First of all, we have done the comparison using a cleaned and stripped text. So any index numbers in the matches array naturally don't correspond to their correct index one we put the all the removed characters back in. This is why we convert that index number into the URN-inspired format described in the preparation step. For example, index 512 might be converted to `p[12]` which means, the 12th letter 'p'. This also solves our second problem: To visualise the matches in the text we surround the matching phrases with HTML `span` elements. But once again, inserting these elements into the text changes the relative index of the following insertion points. Using the 'URNs' as described I can safely assume `p[12]` will remain `p[12]` even after we have inserted all kinds of elements, whitespace and punctuation.

The final visualisation method using in *Comparativus* is the chord diagram. The chord diagram is a lightly altered version of a standard D3 chord diagram with added interactivity to allow selection and highlighting of the matches in the diagram. The most involved part of this process is converting the data from the matches array to a JSON object in a format that is expected by the chord-diagram. Most notably this means converting every match into a nodeA, nodeB and linkAB structure. The JSON data used for this step can also be downloaded separately.

Once all this visualisation is done the process finishes and the user is left with the results to do with as pleases them. They can export this data back into MARKUS, save the data as a file onto their harddisk, or analyze the data further using the provided visualisations.