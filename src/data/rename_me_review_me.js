/**
 * passages.js — Phil-IRI English passage bank (complete)
 *
 * Source: Official DepEd Phil-IRI 2018, English. Text reproduced verbatim from
 * the DepEd source so scoring stays valid (SRS §2.4).
 *
 * NOTE ON SCOPE: The original module was Grade 4 only (SRS §1.2). This bank
 * has been expanded by request to hold ALL extracted English passages —
 * Grades 2–7, both Graded Passages (individual oral/silent reading) and the
 * Group Screening Test (silent). Because passages now span multiple grades and
 * two instruments, each record carries extra fields so assignment stays valid;
 * never hand a learner a passage from the wrong grade/instrument. Filter with
 * getRandomPassage({ grade, instrument, phase, set }) instead of blind random.
 *
 * Record fields:
 *   id          unique, encodes provenance (e.g. phil-iri-eng-pretest-a-g4)
 *   title       passage title (verbatim)
 *   text        passage text (verbatim)
 *   wordCount   screening passages use the DepEd printed count; graded passages
 *               are whitespace-tokenized (the graded pages print no count).
 *               ⚠️  Verify against official printed counts before pilot —
 *               the WPM/rate calculation depends on these.
 *   grade       2–7
 *   type        'narrative' | 'expository'
 *   instrument  'graded'    = individual oral/silent reading (timed, scored)
 *               'screening' = Group Screening Test (silent, 20-item comprehension)
 *   phase       'pretest' | 'posttest' | 'screening'
 *   set         parallel form A–D (graded has 4 forms per grade; screening
 *               has the lettered selections within each grade-level test)
 *
 * Counts: 62 total — 48 graded (24 pre + 24 post, Grades 2–7 × Sets A–D)
 *          + 14 screening (Grades 4–7).
 */

export const passages = [

  // ── GRADED PASSAGES · PRE-TEST (Grades 2–7 × Sets A–D) ──
  {
    id: 'phil-iri-eng-pretest-a-g2',
    title: 'Pam’s Cat',
    text:
      'Pam has a cat. It is on the bed. It can nap. It can sit. “Oh no!” says Pam. “The cat fell off the bed!” Is the cat sad? No. It is on the mat.',
    wordCount: 35,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-a-g3',
    title: 'Summer Fun',
    text:
      '“Let’s have some fun this summer,” says Leo. “Let’s swim in the river,” says Lina. “Let’s get some star apples from the tree,” says Leo. “Let’s pick flowers,” says Lina. “That is so much fun!” says Mama. “But can you help me dust the shelves too?” “Yes, we can Mama,” they say. “Helping can be fun too!”',
    wordCount: 57,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-a-g4',
    title: 'Get Up, Jacky!',
    text:
      '“Ring! Ring!” rang the clock. But Jacky did not get up. “Wake up, Jacky! Time for school,” yelled Mom. And yet Jacky did not get up. “Beep! Beep!” honked the horn of the bus. Jacky still laid snug on the bed. Suddenly, a rooster crowed out loud and sat on the window sill. Jacky got up and said with cheer, “I will get up now. I will!”',
    wordCount: 67,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-a-g5',
    title: 'Frog’s Lunch',
    text:
      'One day, a frog sat on a lily pad, still as a rock. A fish swam by. “Hello, Mr. Frog! What are you waiting for?” “I am waiting for my lunch,” said the frog. “Oh, good luck!” said the fish and swam away. Then, a duck waddled by. “Hello, Mr. Frog! What are you waiting for?” “I am waiting for my lunch,” said the frog. “Oh, good luck!” said the duck and waddled away. Then a bug came buzzing by. “Hello, Mr. Frog! What are you doing?” asked the bug. “I’m having my lunch! Slurp!” said the frog. Mr. Frog smiled.',
    wordCount: 101,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-a-g6',
    title: 'Yawning',
    text:
      'What makes us yawn? Yawning is something that we cannot control. Even in the mother’s womb, eleven-week-old babies have been observed to yawn. But why do we do it? One popular explanation for yawning is that a person may be tired or bored. Although many believe this to be true, it cannot explain why athletes yawn before an event or why dogs yawn before an attack. It is said that yawning is caused by a lack of oxygen and excess carbon dioxide. A good example of this is when we yawn in groups. We yawn because we are competing for air. Others even believe that we yawn to cool our brains off. Cool brains allow us to think more clearly so yawning is said to help us become more alert.',
    wordCount: 130,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-a-g7',
    title: 'Dark Chocolate',
    text:
      'Dark chocolate finds its way into the best ice creams, biscuits and cakes. Although eating chocolate usually comes with a warning that it is fattening, it is also believed by some to have magical and medicinal effects. In fact, cacao trees are sometimes called Theobroma cacao which means “food of the gods.” Dark chocolate has been found out to be helpful in small quantities. One of its benefits is that it has some of the most important minerals and vitamins that people need. It has antioxidants that help protect the heart. Another important benefit is that the fat content of chocolate does not raise the level of cholesterol in the blood stream. A third benefit is that it helps address respiratory problems. Also, it has been found out to help ease coughs and respiratory concerns. Finally, chocolate increases serotonin levels in the brain. This is what gives us a feeling of well-being.',
    wordCount: 152,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-pretest-b-g2',
    title: 'A Hot Day',
    text:
      'The sun is up. “Is it a hot day, Matt?” asks Sal. “Yes, it is,” says Matt. Sal gets her fan. Matt gets his hat. Sal and Matt go out to play. Sal and Matt have fun.',
    wordCount: 37,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-b-g3',
    title: 'A Rainy Day',
    text:
      'Nina and Ria are looking out the window. “I do not like getting wet in the rain,” says Nina. “What can we do?” asks Ria. “We can play house,” says Nina. “Or we can play tag,” says Ria. “Okay, let’s play tag. You’re it!” says Nina. Nina runs from Ria and bumps a lamp. “Oh no!” says Nina. “We must not play tag in the house.”',
    wordCount: 66,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-b-g4',
    title: 'Waiting for the Peddler',
    text:
      'Mama was feeling sick. “Lisa, I cannot make you a snack,” she said. “Can you watch out for the peddler while I rest?” “Yes Mama,” Lisa answered. Soon, a man shouted, “Taho! Taho!” Lisa ran. “Two cups please,” she said. Lisa paid the man. She got one cup of taho and gave the other to Mama. “Thank you, Lisa. I feel much better now,” said Mama. “You’re welcome, Mama!”',
    wordCount: 69,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-b-g5',
    title: 'The Cow and the Carabao',
    text:
      'Long ago, a farmer had a carabao and a cow. The carabao was bigger but the cow worked just as hard. One day the farmer said, “I can get more from my farm if my carabao works all day and my cow works all night.” This went on for a month \'til finally, the carabao cried, “It is just too hot to work all day!” “Want to go for a swim?” asked the cow. “It will cool you off.” The carabao happily agreed. They went off without the farmer’s consent. Before swimming, they hung their skins on a tree branch. But it wasn’t long till the farmer went looking for them. Upon seeing the farmer, they rushed to put on their skins. In their rush, the carabao had worn the cow’s skin and the cow had worn the carabao’s skin. From then on, cows have sagging skin while carabaos have tight skin.',
    wordCount: 152,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-b-g6',
    title: 'Laughter',
    text:
      'People love to laugh. We love it so much when there are jokes, jobs, and shows that are made to make us laugh. Even though laughing seems natural, not many species are able to do so. Laughing involves the performance of rhythmic, involuntary movements, and the production of sounds. We are able to laugh using fifteen facial muscles, our respiratory system, and sometimes even our tear ducts. We are lucky that we are able to laugh because there is strong evidence that laughter can help improve health. Laughter boosts the immune system and adds another layer of protection from disease. Since laughter also increases blood flow, it improves the function of blood vessels that helps protect the heart. Laughter also relaxes the whole body by relieving tension and stress. Finally, laughter also brings out the body’s natural feel-good chemicals that promote well-being.',
    wordCount: 142,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-b-g7',
    title: 'Sneezing',
    text:
      'Sneezing happens when our body is trying to remove an irritation found inside the nose. A special name for this process is sternutation. How does a sneeze happen? When your nose is tickled, the sneeze center in our brain receives a message. Soon, the other parts of the body that work together to create a sneeze such as the abdominal muscles, chest muscles, the diaphragm, the muscles of the vocal chords, the back of the throat, and the eyelids receive this message. An explosion as fast as 161 kilometers per hour sends the irritant speeding out of your nose. Examples of irritants in the air are dust, pepper, or allergens such as pollen. Some experience having a photic reflex and sneeze as soon as they are under the bright sun. Now, if it ever happens that a sneeze of yours gets stuck, look towards a bright light to unstick your stuck sneeze.',
    wordCount: 152,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-pretest-c-g2',
    title: 'Al’s Bag',
    text:
      'Al has a bag. It has a mat. It has buns. It has bananas. But it has ants too! “Ants! Ants!” says Al. Al lets the bag go.',
    wordCount: 28,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-c-g3',
    title: 'Ben’s Store',
    text:
      'Ben has his own store. “Do you sell eggs?” asks Mel. “Yes, come in,” says Ben. “Do you sell milk?” asks Dante. “Yes, come in,” says Ben. “Do you sell hats?” asks Lala. “No, we do not sell hats,” says Ben. “But you can come in and have a look.” Lala goes in. She gets a banana.',
    wordCount: 57,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-c-g4',
    title: 'Anansi’s Web',
    text:
      'Anansi was tired of her web. So one day, she said “I will go live with the ant.” Now, the ant lived in a small hill. Once in the hill Anansi cried, “This place is too dark! I will go live with the bees.” When she got to the beehive, Anansi cried, “This place is too hot and sticky! I will go live with the beetle.” But on her way to beetle’s home she saw her web. “Maybe a web is the best place after all."',
    wordCount: 86,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-c-g5',
    title: 'Pedrito’s Snack',
    text:
      'The bell rang. “It’s snack time!” Pedrito shouted and ran out of the room. He sat on a bench under a tall tree. In Pedrito’s lunch bag were three soft buns. He got the first one and took a bite. “Mmmm,” said Pedrito. Just then, a sparrow sat on the bench. It was looking at him. Pedrito didn’t mind. He went on and finished his bun. Then Pedrito got his second bun. He took a big bite and said “Mmmm!” The sparrow was still looking at him. It also moved closer. But still, Pedrito did not mind. He went on and finished his bun. Finally, Pedrito got his last bun. He was about to take a bite when the sparrow flew up to his shoulder. Pedrito smiled, cut the bun in two and said to himself, “I think someone also likes bread and butter.”',
    wordCount: 144,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-c-g6',
    title: 'Effects of Anger',
    text:
      'Anger is often viewed as harmful. It does not only affect the person feeling this anger but those around him or her. As these feelings get stronger, changes occur in our body. Our faces turn red and carry a frown. Our teeth are clenched and our hands are closed tight. Our breathing becomes heavy and this makes our heart beat faster. Our shoulder and neck muscles become stiff and our blood pressure begins to rise. All these things happen because our body is preparing for something. It is preparing for action. However, this action does not have to be harmful. People are often guilty about feeling angry. But, anger can be viewed positively. Feelings of anger tell you that something is not right and that something needs to change. The challenge lies in making sure that actions resulting from anger will help rather than harm. Expressing our feelings can help others understand the source of our anger rather than fear its consequences.',
    wordCount: 162,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-c-g7',
    title: 'Dust',
    text:
      'No matter how often we sweep the floor of our homes, we are still able to gather together a considerable amount of dust. Dust is all around us. It gathers on bookshelves, on furniture - old or new. These particles rest on any still object – undisturbed until touched or wiped clean. Dust, which was first believed to be made of dead skin has been found to be a mix of different things. Some of the common ingredients of dust particles include animal fur, dead insects, food, fiber from clothes, beddings, soil and other chemicals. Although most of household dust comes from the outside through doors, windows and shoes, other dust particles come from within. Scientists have discovered that the mix of dust from each household actually depends on four things: the climate, the age of the house, the number of persons who live in it and their individual cooking, cleaning and smoking habits. Making our homes free of dust may not be possible but lessening the amount of dust that we keep in our homes will help avoid possible allergies and allow us to breathe well.',
    wordCount: 187,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-pretest-d-g2',
    title: 'Nat Takes a Nap',
    text:
      'Nat will nap. He will nap on his bed. But Nat wet the bed. He cannot nap. Nat is sad. Mama gets Nat. Nat has his nap.',
    wordCount: 27,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-pretest-d-g3',
    title: 'Waiting for Her Sister',
    text:
      'Mara sat by the school gate. It was the end of the day. Mara looked at her watch. “Where is Ate Mila?” she asked. Mara looked at her watch again. At last, Mila has come to pick her up. “Let’s go home. Mama said it’s time for dinner,” says Mila. “I am glad you are here,” says Mara.',
    wordCount: 58,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-pretest-d-g4',
    title: 'Wake Up!',
    text:
      'Every Saturday, Manuel goes to market with his father, Mang Ador. They always pass by Aling Juaning’s stall to buy meat. They go to Mang Tinoy’s for fresh vegetables. They also visit Aling Tita’s seafood section. Whenever Mang Ador buys something, Manuel always tries to predict what his father will cook for lunch. Today, Mang Ador bought tamarind, tomatoes, string beans, radish, and shrimp. “I know what we will have for lunch,” says Manuel happily. Can you guess it, too?',
    wordCount: 80,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-pretest-d-g5',
    title: 'Amy’s Good Deed',
    text:
      'Amy loves walking home from school to see the colors of the leaves and listen to the birds sing. But one day, she heard a soft cry. It came from under a bush. “Should I go near?” Amy wondered. As it grew louder, Amy decided she must help the poor thing. Amy crept closer and held her arm out. Just when she was about to reach out, she saw a pair of eyes and heard a loud “Hissss!!!!” She also felt a sharp pain. “Ouch!” Amy cried. Her arm had four long scratch marks. Amy was upset. She really thought she was doing a good deed.',
    wordCount: 106,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-pretest-d-g6',
    title: 'Dreams',
    text:
      'We often say “Sweet dreams,” but have you ever wondered why we dream? Some say that dreaming is our brain’s way of exercising. While we sleep, our brain may be testing the connections and pathways to see if they are working well. Others believe that dreaming is our brain’s way of sorting out problems. Problems that have not been addressed during the day are sometimes resolved in our sleep. Yet another explanation is that dreaming is our brain’s way of fixing and organizing all the information we have. While sleeping, our brains have a chance to sort out the information that we want to keep from the stuff we no longer want. Still another idea is that dreams are just another form of thinking. Will we ever get to know the answer to this question? Maybe we should sleep on it.',
    wordCount: 141,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-pretest-d-g7',
    title: 'Pain',
    text:
      'How do we sense pain? The human body has nociceptors to receive an electrical impulse that is sent to part of the brain that recognizes pain. Memories of these sensations are formed to help us avoid painful objects and experiences and prevents us from repeating past mistakes that may have hurt us in some way. But pain is more complex. It is not only a physical experience but an emotional and psychological one as well. When all of these come together, it is called suffering. The mind is not alone in recognizing pain. The nervous system is also able to store such information. Even when a person loses a finger or a limb, the pain that was once felt may become a chronic one – one that keeps recurring. The best way to avoid this is to prevent pain memories from forming. The use of anesthesia prevents the mind from creating these memories. Drugs that prevent pain such as analgesics help lessen the pain sensed.',
    wordCount: 165,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'pretest',
    set: 'D',
  },

  // ── GRADED PASSAGES · POST-TEST (Grades 2–7 × Sets A–D) ──
  {
    id: 'phil-iri-eng-posttest-a-g2',
    title: 'The Bib',
    text:
      'Bim-bim has a bib. It is from Tina. The bib is red. It is pretty. But the bib is big. Will this fit? “I will get a pin,” says Dad. “There. It fits!”',
    wordCount: 33,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-a-g3',
    title: 'The Egg on the Grass',
    text:
      'Duck, Hen, and Bird are in the garden. “I see a big, round egg on the grass,” says Bird. “It is not my egg,” says Hen. “My egg is in the nest.” “It is not my egg,” says Duck. “My eggs just hatched.” “It is not an egg,” says Ben. “It’s my rubber ball.”',
    wordCount: 54,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-a-g4',
    title: 'The Tricycle Man',
    text:
      'Nick is a tricycle man. He waits for riders every morning. “Please take me to the bus station,” says Mr. Perez. “Please take me to the market,” says Mrs. Pardo. “Please take us to school,” say Mike and Kris. “But I can take only one of you,” says Nick to the children. “Oh, I can sit behind you Nick,” says Mr. Perez. “Kris or Mike can take my seat." “Thank you, Mr. Perez,” say Mike and Kris.',
    wordCount: 77,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-a-g5',
    title: 'The Snail with the Biggest House',
    text:
      'A little snail told his father, “I want to have the biggest house.” “Keep your house light and easy to carry,” said his father. But, the snail ate a lot until his house grew enormous. “You now have the biggest house,” said the snails. After a while, the snails have eaten all the grass in the farm. They decided to move to another place. “Help! I cannot move,” said the snail with the biggest house. The snails tried to help but the house was too heavy. So the snail with the biggest house was left behind.',
    wordCount: 96,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-a-g6',
    title: 'Rocks from Outer Space',
    text:
      'The pieces of rocks that come from outer space have three names: meteor, meteorite, and meteoroid. A meteoroid is a piece of matter moving in space. It moves as fast as 40 miles a second. It may be large or small. Most meteoroids are smaller than a grain of sand. As a meteoroid comes into the air near the earth, it catches fire. Most meteoroids burn up before they hit the earth. The flash of light from the burning meteoroid is called a meteor. If a piece of meteoroid falls to the ground, it is called a meteorite. People have studied these rocks for many years. They wanted to research ways to keep meteoroids from making holes in spacecrafts. Thick walls may help. Or perhaps spacecrafts can be covered with a metal skin that will seal itself.',
    wordCount: 137,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-a-g7',
    title: 'Diving',
    text:
      'Humans do not have the capacity to breathe underwater unaided by external devices. A diver who wants to stay underwater for more than a few minutes must breathe air on a special mixture of gases. He can wear diving suits and have air pumped to him from above or he can carry tanks of air on his back and breathe through a hose and a mouthpiece. Early divers discovered that it is not enough to supply air to breathe comfortably underwater. The diver’s body is under great pressure in deep water because water weighs 800 times as much as air. Tons of water push against the diver deep in the sea. When this happens, his blood takes in some of the gases he breathes. When the diver rises to the surface, the water pressure becomes less. If he rises too quickly, the gases in his blood form bubbles that make breathing difficult. He suffers from bends, causing him to double up in pain.',
    wordCount: 163,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-posttest-b-g2',
    title: 'Bam and Tagpi',
    text:
      'Bam is sad. “Where is Tagpi?” Where is my pet dog? I want to play with him. He is not in the room.” “Aw! Aw!” “Where are you, Tagpi? Oh, you are in the garden.”',
    wordCount: 35,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-b-g3',
    title: 'The Caps and the Kittens',
    text:
      'Dan and Pepe will play. “But the sun is hot,” says Pepe. “Let us get our caps,” says Dan. “My cap is not on my bed,” says Pepe. “My cap is not in my bag,” says Dan. “Look boys! Our cat has kittens,” says Mama. “ Mik-mik has four kittens!” says Dan. “Yay! The kittens nap in our caps!”',
    wordCount: 59,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-b-g4',
    title: 'Cat and Mouse',
    text:
      'A mouse and a cat lived in an old house. The mouse stayed in a hole while the cat slept under the table. One night, the mouse got out of its hole. “Mmm, Cheese!” it thought, as it went up the table. As it started nibbling the cheese, a fork fell. It woke the cat up so it ran up the table. But the mouse was too fast for the cat. It quickly dashed to its hole. Safe at last!',
    wordCount: 80,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-b-g5',
    title: 'The Great Runner',
    text:
      'Atalanta is a lovely princess and a great runner. One day, her father told her, “It’s time you get married.” “I will marry a man who will beat me in a race,” replied Atalanta. Many young men tried their luck. But they all lost. Hippomenes asked the goddess of love for help. “Here are three golden apples,” she said. “During the race, throw one apple in front of Atalanta. She will stop to pick it up. That should slow her down.” Hippomenes heeded her advice and won the race. Thus, Atalanta became his wife.',
    wordCount: 94,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-b-g6',
    title: 'Beetles',
    text:
      'Beetles can adapt to any kind of environment. They can be found crawling, burrowing, flying, and swimming on every part of the earth except the ocean. Why do beetles survive well on our planet? First, they have tough compact bodies. These help them hide, find food, and lay eggs in places where other insects could never go. Almost all beetles have tough front wings which are colorful and carry beautiful patterns. These wings also act as suit of armor to protect the beetles’ transparent hind wings which are used for flying. Beetles have mouth parts designed for chewing different food. They eat other insects, animal dung, and even cloth. They also feed on the bark, leaves, flowers, and fruits of any kind of plant. They can even chew around the stems of poisonous plants to let the deadly sap drain.',
    wordCount: 140,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-b-g7',
    title: 'The Brain',
    text:
      'The brain is the center of the nervous system. It interprets stimuli and tells the body how to react. The brain has three major parts. The part that controls balance, coordination and muscle movement is called the cerebellum. It makes sure that the muscles work well together. For example, a gymnast is able to balance on a beam because of the cerebellum. The medulla is a long stem that connects the brain to the spinal cord. It tells one’s body to do things without thinking about them. Digesting food or breathing even while asleep are examples of these involuntary actions. On the other hand, there are actions that one decides to do. It is the largest part of the brain—the cerebrum—that is responsible for these voluntary movements. Without it, one will not be able to kick a ball or dance at all. The brain might seem small but it is so powerful as it controls one’s entire body.',
    wordCount: 158,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-posttest-c-g2',
    title: 'Pets',
    text:
      'I am Pat. I have a pet cat. I am Ben. I have a pet hen. I am Mig. I have a pet pig. I am Det. I too will have a pet.',
    wordCount: 33,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-c-g3',
    title: 'A Happy Place',
    text:
      '“Come with me,” says Dan. “Where will we go?” Mina asks. “We will go to a happy place that has lots of balloons.” “We will play, dance, and run. We will have so much fun. We will eat orange cake that our mom and dad baked.” “And then we will sing, Happy birthday, dear Benny!”',
    wordCount: 55,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-c-g4',
    title: 'Marian’s Experiment',
    text:
      'Marian came home from school. She went to the kitchen and saw her mother cooking. “Mama, do we have mongo seeds?” asked Marian. “I will do an experiment.” “Yes, we have some in the cabinet,” answered Mama. Marian got some seeds and planted them in a wooden box. She watered the seeds every day. She made sure they got enough sun. After three days, Marian was happy to see stems and leaves sprouting. Her mongo seeds grew into young plants.',
    wordCount: 80,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-c-g5',
    title: 'Trading Places',
    text:
      'On a trip to a university, the driver told the professor, “I’ve heard you give this speech many times. I can deliver it for you.” The professor said, “The people in this university haven’t seen me yet. Give the lecture. I’ll pretend to be your driver.” When they arrived, the driver was introduced to be the professor. He gave an excellent speech. Everybody applauded. Afterwards, somebody asked a question which the driver could’t answer. In order to get out of the sticky situation, he said, “Oh, that’s such an easy question. Even my driver can give you the answer!”',
    wordCount: 99,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-c-g6',
    title: 'Just How Fast',
    text:
      'Many things around us move at different rates. Glaciers, which are frozen rivers of snow, move less than one foot in a day. A box turtle travels about ten feet per minute, while a snail travels five inches per hour. A chimney swift flies almost ninety miles per hour. This is the fastest speed recorded for any living creature. A hydroplane skims across the top of the water at nearly 300 miles an hour. Some racing cars travel more than 500 miles per hour. The wind in a tornado may move at 600 miles per hour but sound waves are faster with a speed of up to 740 miles per hour. The Earth moves around the sun at 67,000 miles per hour. At 186,000 miles per second, light is faster! Science has yet to discover anything that would surpass this speed.',
    wordCount: 141,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-c-g7',
    title: 'Air Currents',
    text:
      'Wind is the natural movement of the air from one place to another. It affects the climate of a place. There are three major air streams that greatly affect our climate. From November to February, mornings are colder because of the northeast monsoon wind. It blows from Siberia which is a very frigid place. It brings along temperature and rain that make us shiver. The wind from June to October, is warm and humid. During this time, the western section of our country experiences strong rains brought about by the southwest monsoon wind blowing from Australia. From March to early May, trade winds coming from the east or northeast reach the Philippines. It brings rains to the eastern part of our country. Trade winds are warm and moist and bring hot temperature with little rain. Isn’t it amazing that each one of these air streams brings some amount of rain to the Philippines?',
    wordCount: 153,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-posttest-d-g2',
    title: 'Where the Pets Sat',
    text:
      'Mat is a cat. Mat sat on a hat. Jig is a pig. Jig sat on a wig. Len is a hen. Len did not sit on a hat or a wig. Len sat on ten eggs!',
    wordCount: 37,
    grade: 2,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-posttest-d-g3',
    title: 'In the Park',
    text:
      'Today, Sam and Ria will go to the park. What will they do there? They will sit on the grass and look at some bugs. They will look at the holes that the worms have just dug. That is where they will stay on this warm summer day. But they must leave the park before it gets dark.',
    wordCount: 58,
    grade: 3,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-posttest-d-g4',
    title: 'On Market Day',
    text:
      'Every Saturday, Manuel goes to market with his father, Mang Ador. They always pass by Aling Juaning’s stall to buy meat. They go to Mang Tinoy’s for fresh vegetables. They also visit Aling Tita’s seafood section. Whenever Mang Ador buys something, Manuel always tries to predict what his father will cook for lunch. Today Mang Ador bought tamarind, tomatoes, string beans, radish, and shrimp. “I know what we will have for lunch,” says Manuel happily. Can you guess it, too?',
    wordCount: 80,
    grade: 4,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-posttest-d-g5',
    title: 'The Legend of the Firefly',
    text:
      'There was a time when young and old stars could talk to Bathala. One day, the young stars learned that they become part of a black hole when they grow old. The young stars feared losing their light. They asked Bathala for help. “I have a solution. But you have to give up a lot,” said Bathala. “You need to leave the heavens and live on land.” Some of the younger stars agreed. On a dark night, you might chance upon these stars. They have turned into tiny twinkling bugs whose tails flicker as they fly from place to place.',
    wordCount: 100,
    grade: 5,
    type: 'narrative',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-posttest-d-g6',
    title: 'Flying Rocks',
    text:
      'There are rocks in our Solar System that never flocked together to form planets. Larger ones called asteroids gather in the Asteroid Belt, a strip found between Mars and Jupiter. Some asteroids don’t move along this belt but have paths that bring them close to the earth. These are called Apollo Asteroids. There may be half a million asteroids whose diameters are bigger than one kilometer. The largest asteroid is over 1000 kilometers across. It is speculated that many asteroids were once larger but they collided with each other and became small fragments. Unlike asteroids, meteoroids are small rocky bodies, that are scattered in space and do not orbit the sun. They cross the Earth’s orbit and are often seen burning up in the Earth’s atmosphere at night. The faint flashes of light they make are called shooting stars.',
    wordCount: 139,
    grade: 6,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-posttest-d-g7',
    title: 'Ecosystem',
    text:
      'Ecosystems consist of living and non-living organisms in an area. These include plants, animals, microbes, and elements like soil, water, and air. The living organisms depend on both living and non-living aspects of an ecosystem. An ecosystem can be as small as a puddle or as big as an ocean. It is a very delicate balance, with these life forms sustaining one another. Disruptions to an ecosystem may prove disastrous to all its organisms. When a new plant or animal is suddenly placed in an ecosystem, it will surely compete with the original inhabitants for resources. This stranger may even push out the natural organisms, causing them to be extinct. The organisms that depended on the extinct organisms will definitely be affected. The balance in ecosystems have been unsettled by natural disasters such as fires, floods, storms, and volcanic eruptions. However, in recent years and ironically, in the name of progress, human activity has affected many ecosystems around the world.',
    wordCount: 160,
    grade: 7,
    type: 'expository',
    instrument: 'graded',
    phase: 'posttest',
    set: 'D',
  },

  // ── GROUP SCREENING TEST (Grades 4–7 · silent reading) ──
  {
    id: 'phil-iri-eng-gst-g4-a',
    title: 'The Best Part of the Day',
    text:
      'Mia was in her bedroom when she heard a rooster crow. Then she heard a man yell, “Hot pandesal! Buy your hot pandesal!” Mia wanted to sleep some more. But she knew she might be late for school if she did. Finally, she began to smell fried eggs and fish. “It’s time to get up,” she said. Mia jumped out of bed and ran down the steps.',
    wordCount: 67,
    grade: 4,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-gst-g4-b',
    title: 'Ice Cream for Sale',
    text:
      '“Cling! Cling! Cling!” Benito and his sister Nelia raced out the door. He took some coins from his pocket and counted them. “I can have two scoops,” he thought. But then his little sister Nelia asked, “Can I have an ice cream?” Benito looked at his coins again. “May I have two cones?” he asked. The vendor nodded. Benito and Nelia left with a smile.',
    wordCount: 65,
    grade: 4,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-gst-g4-c',
    title: 'At Last!',
    text:
      'The spotted egg finally hatched. Out came a little bird who was afraid. The tree where his mother built their nest was just too tall. “I don’t know how to fly,” he thought. He looked around for his mother, but she was not there. Where could she be? He looked down and felt his legs shake. He started to get dizzy and fell out of his nest. He quickly flapped his wings. At last – he was flying.',
    wordCount: 84,
    grade: 4,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-gst-g4-d',
    title: 'The Owl and the Rooster',
    text:
      'While the other owls slept in the day time, Hootie slept at night. She always yawned and fell asleep when her friends asked her to hoot with them. This made her sad because she liked hooting a lot. One day, she met a rooster who could not wake up in the morning. He could not awaken the villagers. This made the rooster unhappy. Hootie said, “I know how to help you. I’ll hoot in the morning so you can wake up to do your job!”',
    wordCount: 84,
    grade: 4,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-gst-g5-a',
    title: 'Early Start',
    text:
      'Mara woke up with a start. “Oh no!” The sun was shining brightly on her face. She looked at her alarm clock. She was not going to make it to school. She hurriedly put on her uniform, gathered her things and dumped them into her bag. She rushed so that she could be in school before the bell rang. As she was going out the door, her mother stopped her and asked, “Why are you rushing? Did you forget? It’s Saturday today!”',
    wordCount: 82,
    grade: 5,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-gst-g5-b',
    title: 'Rice for Lunch',
    text:
      'Anika washed the rice grains. Then she put them into a pot. She also put in two cups of water. Finally, she covered the pot and left it on the electric stove. After twenty minutes, she went to check on the pot. It was not hot. She saw that the plug was still on the floor. Anika looked at the clock and shook her head. It was almost lunchtime.',
    wordCount: 69,
    grade: 5,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-gst-g5-c',
    title: 'The Gift',
    text:
      'The colorfully-wrapped box was lying on the table when Mario got home. Thinking that it was his parents’ birthday gift to him, he took it and quickly tore it open. It was the coolest looking pair of shoes he had ever seen. Mario put them on, walked out into the street and jumped into a puddle. “Mario, why are you wearing your brother’s shoes?” his Mother cried. When he looked down, he said, “Oh no, that’s a lot of cleaning I have to do.”',
    wordCount: 83,
    grade: 5,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-gst-g5-d',
    title: 'One Stormy Night',
    text:
      'That night, Jessica helped her mother close the windows. The wind was howling. Droplets of rain started pelting the roof. “Go find the candles and I will get the matches,” said her mother. Lightning flashed. A clap of thunder followed. Soon after, the lights went off. “A blackout!” shouted Jessica. “Don’t be alarmed. It’s a good thing we have what we need,” said mother.',
    wordCount: 58,
    grade: 5,
    type: 'narrative',
    instrument: 'screening',
    phase: 'screening',
    set: 'D',
  },
  {
    id: 'phil-iri-eng-gst-g6-a',
    title: 'Chameleons',
    text:
      'Chameleons are extraordinary animals. They are one of the few animals that can change their color. This is their way of hiding themselves. Chameleons that live in trees are often green. Those that live in desert lands are usually brown. It is also their way of keeping warm. Turning a darker shade helps them absorb more heat. They also change colors to send messages to other chameleons. Their bright colors may attract another chameleon or warn enemies.',
    wordCount: 82,
    grade: 6,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-gst-g6-b',
    title: 'The Philippine Eagle',
    text:
      'The Philippine Eagle has replaced the maya as our national bird. It is one of the three largest and strongest eagles in the world. But it is in danger of extinction. Hunting and deforestation have caused the number of Philippine Eagles to dwindle. Scientists have tried to increase their number by breeding them in captivity. The first eagle to be bred in captivity is Pag-asa. At 25 years old, Pag-asa is not yet suited to be released to the wild as she has developed dependency on her human keeper.',
    wordCount: 89,
    grade: 6,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-gst-g6-c',
    title: 'Home to Millions of Fish',
    text:
      'Coral reefs are found in shallow areas of tropical ocean waters. They are like beautiful underground gardens that grow in salty waters. Millions of fish and sea plants make their home in the reefs as these provide a safe sanctuary for them. They allow small fish to hide from large predator fish. But many coral reefs are in trouble. Water pollution is destroying many reefs. Tourism likewise harms them. If reefs are damaged, we will lose many of our most beautiful fish.',
    wordCount: 82,
    grade: 6,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'C',
  },
  {
    id: 'phil-iri-eng-gst-g7-a',
    title: 'Telling Time',
    text:
      'Humans have used different objects to tell time. In the beginning, they used an hourglass. This is a cylindrical glass with a narrow center which allows sand to flow from its upper to its lower portion. Once all the sand has trickled to the lower portion, one knows that an hour has passed. Using the same idea, water clocks were constructed to measure time by having water flow through a narrow passage from one container to another. On the other hand, sundials allowed people to estimate an hour by looking at the position of the shadow cast by the sun on a plate. At night, people measured time by checking the alignment of the stars in the sky. None of these were accurate, though. The clock was the first accurate instrument for telling time.',
    wordCount: 134,
    grade: 7,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'A',
  },
  {
    id: 'phil-iri-eng-gst-g7-b',
    title: 'Counting the Hours',
    text:
      'When men decided to divide the day into twenty-four hours, they used numbers one through twelve two times. As a result, there was one o’clock during the day and another one o’clock after midnight. This created confusion. If one was told to submit a project at six o’clock, did this mean six o’clock in the morning or at night? The Romans provided a solution to this problem. They thought that noon time, the time when the sun is at its apex, is an important time. They called noon Meridies and measured time by this. They called the morning ante meridiem, which means “before noon” while “after noon” was called post meridiem. Ante meridiem was shortened to A.M. while post meridiem was shortened to P.M.',
    wordCount: 124,
    grade: 7,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'B',
  },
  {
    id: 'phil-iri-eng-gst-g7-c',
    title: 'Nosebleeds',
    text:
      'Having a nosebleed is a common occurrence. Children experience epistaxis when blood flows out from either or both nostrils, often for a short period of time. It may be caused by one’s behavior like frequent nose picking or blowing too hard when one has a cold. It may also be caused by certain physical factors such as an allergy or abnormal growths in the nasal cavity. Or it may be due to environmental conditions such as exposure to toxic fumes or dryness of the air. While it is often thought that holding one’s head back can treat a nosebleed, this can actually cause one to choke or vomit. The best thing to do is to lean forward, pinch the top of the nose and apply a cold compress. And if that doesn’t work, it’s best to get professional help.',
    wordCount: 139,
    grade: 7,
    type: 'expository',
    instrument: 'screening',
    phase: 'screening',
    set: 'C',
  },
]

/**
 * Returns a randomly selected passage from the bank.
 *
 * Backward compatible: called with no arguments it picks from ALL passages,
 * exactly like before. Pass a filter to restrict the pool — strongly
 * recommended in a real session so the learner gets a grade-appropriate
 * passage from the correct instrument.
 *
 * @param {{ grade?: number, instrument?: 'graded'|'screening',
 *           phase?: 'pretest'|'posttest'|'screening', set?: string }} [filter]
 * @returns {{ id: string, title: string, text: string, wordCount: number,
 *             grade: number, type: string, instrument: string,
 *             phase: string, set: string }}
 */
export function getRandomPassage(filter = {}) {
  const pool = passages.filter(
    (p) =>
      (filter.grade == null || p.grade === filter.grade) &&
      (filter.instrument == null || p.instrument === filter.instrument) &&
      (filter.phase == null || p.phase === filter.phase) &&
      (filter.set == null || p.set === filter.set)
  )
  const source = pool.length > 0 ? pool : passages
  const index = Math.floor(Math.random() * source.length)
  return source[index]
}

/**
 * Returns every passage matching the given grade (and optional instrument).
 * @param {number} grade
 * @param {'graded'|'screening'} [instrument]
 */
export function getPassagesByGrade(grade, instrument) {
  return passages.filter(
    (p) => p.grade === grade && (instrument == null || p.instrument === instrument)
  )
}